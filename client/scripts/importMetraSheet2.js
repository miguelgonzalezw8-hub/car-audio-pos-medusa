import fs from "fs";
import Papa from "papaparse";
import admin from "firebase-admin";
import path from "path";

const serviceAccount = JSON.parse(
  fs.readFileSync(
    path.resolve("serviceAccountKey.json"),
    "utf8"
  )
);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const csv = fs.readFileSync(
  "src/data/metra/Metra_Vehicle_Application_Guide sheet 2.csv",
  "utf8"
);

const { data } = Papa.parse(csv, {
  header: true,
  skipEmptyLines: true,
});

function speaker(row, prefix, n) {
  const loc = row[`${prefix} Location ${n}`];
  const size = row[`${prefix} Size ${n}`];
  if (!loc && !size) return null;

  return {
    location: loc || "",
    size: size || "",
    harness: row["Speaker harness"] || "",
    adapter: row["Speaker adapter"] || "",
  };
}

(async () => {
  for (const row of data) {
    if (!row.MAKE || !row.MODEL || !row["Start Year"]) continue;

    await db.collection("metra_speakers").add({
      make: row.MAKE,
      model: row.MODEL,
      trim: row["TRIM/QUALIFIER"] || "",
      bodyStyle: row["BODY STYLE"] || "",
      yearStart: Number(row["Start Year"]),
      yearEnd: Number(row["End Year"] || row["Start Year"]),

      front: {
        l1: speaker(row, "Front -", 1),
        l2: speaker(row, "Front -", 2),
        l3: speaker(row, "Front -", 3),
      },
      rear: {
        l1: speaker(row, "Rear -", 1),
        l2: speaker(row, "Rear -", 2),
        l3: speaker(row, "Rear -", 3),
      },

      subwoofers: row.OTHER?.toLowerCase().includes("sub")
        ? row.OTHER
        : null,
    });
  }

  console.log("✅ Metra Sheet 2 imported");
})();
