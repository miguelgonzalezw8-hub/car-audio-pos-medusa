// ===============================================
//  FITMENT ENGINE — FINAL VERSION
//  Fully compatible with your CSV-generated fitment.json
// ===============================================

import fitmentData from "../data/fitment.json";
import productCatalog from "../data/products.json";

// Helper
const normalize = (s) => (s || "").toString().trim().toLowerCase();

// --------------------------------------------------
// YEAR OPTIONS
// --------------------------------------------------
export function getYearOptions() {
  const years = new Set();

  fitmentData.forEach((v) => {
    for (let y = v.yearStart; y <= v.yearEnd; y++) {
      years.add(y);
    }
  });

  return [...years].sort((a, b) => b - a);
}

// --------------------------------------------------
// MAKE OPTIONS
// --------------------------------------------------
export function getMakeOptions(year) {
  const makes = new Set();

  fitmentData.forEach((v) => {
    if (!year || (year >= v.yearStart && year <= v.yearEnd)) {
      makes.add(v.make);
    }
  });

  return [...makes].sort();
}

// --------------------------------------------------
// MODEL OPTIONS
// --------------------------------------------------
export function getModelOptions(year, make) {
  const models = new Set();

  fitmentData.forEach((v) => {
    const matchYear = !year || (year >= v.yearStart && year <= v.yearEnd);
    const matchMake = !make || normalize(v.make) === normalize(make);

    if (matchYear && matchMake) {
      models.add(v.model);
    }
  });

  return [...models].sort();
}

// --------------------------------------------------
// FIND FITMENT ENTRY
// --------------------------------------------------
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

// --------------------------------------------------
// PRODUCT CATEGORY NORMALIZATION
// --------------------------------------------------
function normalizeCategory(cat = "") {
  const c = cat.toLowerCase();

  if (c.includes("speaker") || c.includes("tweeter") || c.includes("coax"))
    return "Speakers";

  if (c.includes("sub")) return "Subwoofers";

  if (c.includes("amp")) return "Amplifiers";

  if (
    c.includes("dash") ||
    c.includes("kit") ||
    c.includes("harness") ||
    c.includes("adapter")
  )
    return "Install";

  return "Other";
}

// --------------------------------------------------
// MATCH RECOMMENDED PRODUCTS
// --------------------------------------------------
export function getRecommendedProducts(fitment) {
  if (!fitment) return [];

  const neededSizes = new Set();
  const neededAdapters = new Set();
  const neededHarnesses = new Set();

  // ---- SPEAKERS ----
  const allSpeakerGroups = [
    ...(fitment.speakers?.front || []),
    ...(fitment.speakers?.rear || []),
    ...(fitment.speakers?.other || []),
  ];

  allSpeakerGroups.forEach((s) => {
    if (s.size) neededSizes.add(s.size.trim());
    if (s.adapter) neededAdapters.add(s.adapter.trim());
    if (s.harness) neededHarnesses.add(s.harness.trim());
  });

  // ---- RADIO ----
  const neededDashKit = fitment.radio?.dashKit || "";
  const neededRadioHarness = fitment.radio?.harness || "";
  const neededAntenna = fitment.radio?.antennaAdapter || "";

  const rec = [];

  // === MATCH SPEAKERS BY SIZE ===
  productCatalog
    .filter((p) => p.category === "speaker")
    .forEach((p) => {
      if (p.size && neededSizes.has(p.size.trim())) rec.push(p);
    });

  // === MATCH SPEAKER ADAPTERS ===
  productCatalog
    .filter((p) => p.category === "speaker_adapter" && p.metraCode)
    .forEach((p) => {
      if (neededAdapters.has(p.metraCode.trim())) rec.push(p);
    });

  // === MATCH SPEAKER HARNESSES ===
  productCatalog
    .filter((p) => p.category === "speaker_harness" && p.metraCode)
    .forEach((p) => {
      if (neededHarnesses.has(p.metraCode.trim())) rec.push(p);
    });

  // === DASH KIT ===
  if (neededDashKit !== "N/R" && neededDashKit !== "") {
    const match = productCatalog.find(
      (p) => p.category === "dash_kit" && normalize(p.metraCode) === normalize(neededDashKit)
    );
    if (match) rec.push(match);
  }

  // === RADIO HARNESS ===
  if (neededRadioHarness) {
    const match = productCatalog.find(
      (p) =>
        p.category === "radio_harness" &&
        normalize(p.metraCode) === normalize(neededRadioHarness)
    );
    if (match) rec.push(match);
  }

  // === ANTENNA ADAPTER ===
  if (neededAntenna && neededAntenna !== "N/R") {
    const match = productCatalog.find(
      (p) =>
        p.category === "antenna_adapter" &&
        normalize(p.metraCode) === normalize(neededAntenna)
    );
    if (match) rec.push(match);
  }

  // Dedupe
  const seen = new Set();
  const unique = [];

  for (const p of rec) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      unique.push({
        ...p,
        categoryNorm: normalizeCategory(p.category),
      });
    }
  }

  return unique;
}