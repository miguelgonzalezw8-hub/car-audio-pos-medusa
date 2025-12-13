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

const csv = fs.readFileSync("src/data/maestro/maestro.csv", "utf8");

const { data } = Papa.parse(csv, {
  header: true,
  skipEmptyLines: true,
});

(async () => {
  for (const row of data) {
    if (!row.Make || !row.Model || !row.Year) continue;

    await db.collection("maestro").add({
      make: row.Make,
      model: row.Model,
      year: Number(row.Year),
      radioType: row.Radio,
      retention: row.Features,
      notes: row.Notes || "",
    });
  }

  console.log("✅ Maestro imported");
})();
