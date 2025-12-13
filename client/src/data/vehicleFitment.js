// src/data/vehicleFitment.js

import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

/* 🔥 EXACT collection name */
const VEHICLE_COLLECTION = "vehicleFitment";

/* ================================
   VEHICLE SELECTOR
   ================================ */

export async function getYearOptions() {
  const snap = await getDocs(collection(db, VEHICLE_COLLECTION));
  const years = new Set();

  snap.forEach((doc) => {
    const d = doc.data();

    // Preferred: explicit years array
    if (Array.isArray(d.years)) {
      d.years.forEach((y) => years.add(Number(y)));
      return;
    }

    // Fallback: yearStart/yearEnd
    if (
      typeof d.yearStart === "number" &&
      typeof d.yearEnd === "number"
    ) {
      for (let y = d.yearStart; y <= d.yearEnd; y++) {
        years.add(y);
      }
    }
  });

  return Array.from(years).sort((a, b) => b - a);
}

export async function getMakeOptions(year) {
  if (!year) return [];

  const snap = await getDocs(collection(db, VEHICLE_COLLECTION));
  const makes = new Set();

  snap.forEach((doc) => {
    const d = doc.data();

    const validYear =
      (Array.isArray(d.years) && d.years.includes(Number(year))) ||
      (typeof d.yearStart === "number" &&
        typeof d.yearEnd === "number" &&
        d.yearStart <= year &&
        d.yearEnd >= year);

    if (validYear && d.make) {
      makes.add(d.make);
    }
  });

  return Array.from(makes).sort();
}

export async function getModelOptions(year, make) {
  if (!year || !make) return [];

  const q = query(
    collection(db, VEHICLE_COLLECTION),
    where("make", "==", make)
  );

  const snap = await getDocs(q);
  const models = new Set();

  snap.forEach((doc) => {
    const d = doc.data();

    const validYear =
      (Array.isArray(d.years) && d.years.includes(Number(year))) ||
      (typeof d.yearStart === "number" &&
        typeof d.yearEnd === "number" &&
        d.yearStart <= year &&
        d.yearEnd >= year);

    if (validYear && d.model) {
      models.add(d.model);
    }
  });

  return Array.from(models).sort();
}

/* ================================
   FIND FULL VEHICLE FITMENT RECORD
   ================================ */

export async function findVehicleFitment(year, make, model) {
  if (!year || !make || !model) return null;

  const q = query(
    collection(db, VEHICLE_COLLECTION),
    where("make", "==", make),
    where("model", "==", model)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  return (
    snap.docs.find((doc) => {
      const d = doc.data();
      return (
        (Array.isArray(d.years) && d.years.includes(Number(year))) ||
        (typeof d.yearStart === "number" &&
          typeof d.yearEnd === "number" &&
          d.yearStart <= year &&
          d.yearEnd >= year)
      );
    })?.data() || null
  );
}
