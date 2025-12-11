// ===============================================
//  FITMENT ENGINE — with location/brand-aware
// ===============================================

import fitmentData from "../data/fitment.json";
import productCatalog from "../data/products.json";

import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// ---------------- Helpers ----------------
const normalize = (s) => (s || "").toString().trim().toLowerCase();

function normalizeSpeakerSize(size = "") {
  let s = size.toString().trim().toLowerCase();

  s = s.replace(/[“”″]/g, '"');
  s = s.replace(/"/g, "");

  s = s.replace(/^(\d+)\s*1\/2$/, (_, n) => `${n}.5`);
  s = s.replace(/^(\d+)\.50$/, (_, n) => `${n}.5`);

  s = s.replace(/\s*x\s*/g, "x");
  s = s.replace(/\s+/g, "");

  return s.trim();
}

function normalizeCategory(cat = "") {
  const c = cat.toLowerCase();

  if (
    c.includes("speaker") ||
    c.includes("front") ||
    c.includes("rear") ||
    c.includes("tweeter") ||
    c.includes("component") ||
    c.includes("coax")
  )
    return "Speakers";

  if (c.includes("sub")) return "Subwoofers";
  if (c.includes("amp")) return "Amplifiers";

  if (
    c.includes("dash") ||
    c.includes("kit") ||
    c.includes("harness") ||
    c.includes("adapter") ||
    c.includes("interface") ||
    c.includes("mount")
  )
    return "Install";

  return "Other";
}

function prettyLocationTag(zone, locationLabel) {
  const z = zone || "Front";
  const loc = (locationLabel || "").trim();
  if (!loc) return z;
  return `${z} - ${loc}`; // e.g. "Front - Dash Corner"
}

// ---------------- Year/Make/Model ----------------
export function getYearOptions() {
  const years = new Set();
  fitmentData.forEach((v) => {
    for (let y = v.yearStart; y <= v.yearEnd; y++) years.add(y);
  });
  return [...years].sort((a, b) => b - a);
}

export function getMakeOptions(year) {
  const makes = new Set();
  fitmentData.forEach((v) => {
    if (!year || (year >= v.yearStart && year <= v.yearEnd)) makes.add(v.make);
  });
  return [...makes].sort();
}

export function getModelOptions(year, make) {
  const models = new Set();
  fitmentData.forEach((v) => {
    const matchYear = !year || (year >= v.yearStart && year <= v.yearEnd);
    const matchMake = !make || normalize(v.make) === normalize(make);
    if (matchYear && matchMake) models.add(v.model);
  });
  return [...models].sort();
}

export function findFitment(year, make, model) {
  if (!year || !make || !model) return null;
  return (
    fitmentData.find(
      (v) =>
        normalize(v.make) === normalize(make) &&
        normalize(v.model) === normalize(model) &&
        year >= v.yearStart &&
        year <= v.yearEnd
    ) || null
  );
}

// ---------------- Main Recommendation Engine ----------------
export async function getRecommendedProducts(fitment) {
  if (!fitment) return [];

  const neededSizes = new Set();
  const neededAdapters = new Set();
  const neededHarnesses = new Set();

  const localMatches = [];
  let firestoreMatches = [];

  // ===== Build speaker entries w/ zone + location =====
  const allSpeakerEntries = [];

  (fitment.speakers?.front || []).forEach((s) => {
    allSpeakerEntries.push({
      ...s,
      _zone: "Front",
    });
  });

  (fitment.speakers?.rear || []).forEach((s) => {
    allSpeakerEntries.push({
      ...s,
      _zone: "Rear",
    });
  });

  (fitment.speakers?.other || []).forEach((s) => {
    allSpeakerEntries.push({
      ...s,
      _zone: "Other",
    });
  });

  // Map of size -> Set(locationTag)
  const locationTagsBySize = {};

  allSpeakerEntries.forEach((s) => {
    const normSize = normalizeSpeakerSize(s.size);
    if (!normSize) return;

    const tag = prettyLocationTag(s._zone, s.location);
    if (!locationTagsBySize[normSize]) {
      locationTagsBySize[normSize] = new Set();
    }
    locationTagsBySize[normSize].add(tag);

    neededSizes.add(normSize);
    if (s.adapter) neededAdapters.add((s.adapter || "").trim());
    if (s.harness) neededHarnesses.add((s.harness || "").trim());
  });

  // ---- Radio data (for future harness/dash-kit matching) ----
  const neededDashKit = fitment.radio?.dashKit || "";
  const neededRadioHarness = fitment.radio?.harness || "";
  const neededAntenna = fitment.radio?.antennaAdapter || "";

  // ===== LOCAL JSON SPEAKERS =====
  productCatalog
    .filter((p) => p.category === "speaker")
    .forEach((p) => {
      const norm = normalizeSpeakerSize(p.size);
      if (neededSizes.has(norm)) {
        localMatches.push({
          ...p,
          locations: Array.from(locationTagsBySize[norm] || []),
        });
      }
    });

  // ===== LOCAL JSON INSTALL PARTS =====
  productCatalog.forEach((p) => {
    const cat = p.category;
    const code = (p.metraCode || "").trim();

    if (cat === "speaker_adapter" && neededAdapters.has(code)) {
      localMatches.push(p);
    }

    if (cat === "speaker_harness" && neededHarnesses.has(code)) {
      localMatches.push(p);
    }

    if (cat === "dash_kit" && neededDashKit && normalize(code) === normalize(neededDashKit)) {
      localMatches.push(p);
    }

    if (cat === "radio_harness" && neededRadioHarness && normalize(code) === normalize(neededRadioHarness)) {
      localMatches.push(p);
    }

    if (cat === "antenna_adapter" && neededAntenna && normalize(code) === normalize(neededAntenna)) {
      localMatches.push(p);
    }
  });

  // ===== FIRESTORE SPEAKERS (dynamic products) =====
  const sizeArray = [...neededSizes];
  if (sizeArray.length > 0) {
    try {
      const qFS = query(
        collection(db, "products"),
        where("category", "==", "Speakers"),
        where("speakerSize", "in", sizeArray)
      );
      const snap = await getDocs(qFS);
      firestoreMatches.push(
        ...snap.docs.map((doc) => {
          const d = doc.data();
          const norm = normalizeSpeakerSize(d.speakerSize || d.size || "");
          return {
            id: doc.id,
            ...d,
            speakerSize: norm,
            locations: Array.from(locationTagsBySize[norm] || []),
          };
        })
      );
    } catch (err) {
      console.error("Firestore speakers match error:", err);
    }
  }

  // ===== MERGE + DEDUPE =====
  const combined = [...localMatches, ...firestoreMatches];
  const seen = new Set();
  const final = [];

  for (const p of combined) {
    const key = p.id || p.sku || p.name;
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);

    final.push({
      ...p,
      categoryNorm: normalizeCategory(p.category),
    });
  }

  return final;
}
