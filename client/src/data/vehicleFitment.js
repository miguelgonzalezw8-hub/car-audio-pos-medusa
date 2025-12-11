// src/data/vehicleFitment.js

import fitmentData from "./fitment.json";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

/* ================================
   CORE FITMENT DATA
   ================================ */

export const vehicleFitment = fitmentData;

/* ================================
   BASIC SELECTOR HELPERS
   ================================ */

export function getYearOptions() {
  const years = new Set();

  vehicleFitment.forEach((v) => {
    const start = Number(v.yearStart) || 0;
    const end = Number(v.yearEnd) || start || 0;

    for (let y = start; y <= end; y++) {
      if (y) years.add(y);
    }
  });

  return Array.from(years).sort((a, b) => b - a);
}

export function getMakeOptions(year) {
  if (!year) return [];

  return [
    ...new Set(
      vehicleFitment
        .filter(
          (v) =>
            year >= v.yearStart &&
            year <= v.yearEnd
        )
        .map((v) => v.make)
    ),
  ].sort();
}

export function getModelOptions(year, make) {
  if (!year || !make) return [];

  return [
    ...new Set(
      vehicleFitment
        .filter(
          (v) =>
            year >= v.yearStart &&
            year <= v.yearEnd &&
            v.make === make
        )
        .map((v) => v.model)
    ),
  ].sort();
}

/**
 * Find a fitment record for a vehicle.
 * Prefers trim "All" if multiple match.
 */
export function findFitment(year, make, model) {
  if (!year || !make || !model) return null;

  const candidates = vehicleFitment.filter((v) => {
    const start = Number(v.yearStart) || 0;
    const end = Number(v.yearEnd) || start || 0;

    return (
      year >= start &&
      year <= end &&
      v.make === make &&
      v.model === model
    );
  });

  if (candidates.length === 0) return null;

  const allTrim = candidates.find(
    (v) => (v.trim || "").toLowerCase() === "all"
  );

  return allTrim || candidates[0];
}

/* ================================
   NORMALIZATION HELPERS
   ================================ */

function normalizeSize(val) {
  if (!val) return "";

  let s = val.toString().toLowerCase().trim();

  const fractionMap = {
    "6 1/2": "6.5",
    "5 1/4": "5.25",
    "6 3/4": "6.75",
    "3 1/2": "3.5",
    "2 1/2": "2.5",
  };

  if (fractionMap[s]) return fractionMap[s];

  s = s.replace(/\s*x\s*/g, "x");
  s = s.replace(/"/g, "").replace(/\s+/g, "");

  return s;
}

/* ================================
   METRA PART EXTRACTION
   ================================ */

function extractVehiclePartNumbers(fitment) {
  const parts = new Set();

  if (!fitment) return [];

  if (fitment.radio) {
    Object.values(fitment.radio).forEach((val) => {
      if (typeof val === "string" && val.trim()) {
        parts.add(val.trim());
      }
    });
  }

  ["front", "rear", "other"].forEach((section) => {
    (fitment.speakers?.[section] || []).forEach((s) => {
      if (!s) return;
      if (s.adapter && s.adapter.trim()) parts.add(s.adapter.trim());
      if (s.harness && s.harness.trim()) parts.add(s.harness.trim());
    });
  });

  return Array.from(parts);
}

function extractVehicleSpeakerSizes(fitment) {
  const sizes = new Set();

  if (!fitment?.speakers) return [];

  ["front", "rear", "other"].forEach((section) => {
    (fitment.speakers[section] || []).forEach((s) => {
      if (s?.size) {
        sizes.add(normalizeSize(s.size));
      }
    });
  });

  return Array.from(sizes);
}

/* ================================
   🔥 FITMENT RESOLVER (IMPORTANT)
   ================================ */

function ensureFitment(input) {
  if (!input) return null;

  // Already a full fitment record
  if (input.speakers || input.radio) return input;

  // Otherwise resolve from vehicle selection
  return findFitment(input.year, input.make, input.model);
}

/* ================================
   MAIN RECOMMENDER
   ================================ */

export async function getRecommendedProducts(vehicleLike) {
  const fitment = ensureFitment(vehicleLike);
  if (!fitment) return [];

  const metraParts = extractVehiclePartNumbers(fitment);
  const speakerSizes = extractVehicleSpeakerSizes(fitment);

  const snap = await getDocs(collection(db, "products"));
  const products = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  return products.filter((item) => {
    const sku = (item.sku || "").trim();

    // 1) Metra accessories
    if (sku && metraParts.includes(sku)) return true;

    // 2) Speakers by size (C1-650x FIX ✅)
    const category = (item.category || "").toLowerCase();

    if (
      (category === "speaker" || category === "speakers") &&
      item.speakerSize &&
      speakerSizes.includes(normalizeSize(item.speakerSize))
    ) {
      return true;
    }

    return false;
  });
}
