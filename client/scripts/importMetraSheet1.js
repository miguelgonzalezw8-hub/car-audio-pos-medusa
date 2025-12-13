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
  "src/data/metra/Metra_Vehicle_Application_Guide sheet 1.csv",
  "utf8"
);

const { data } = Papa.parse(csv, {
  header: true,
  skipEmptyLines: true,
});

(async () => {
  for (const row of data) {
    if (!row.MAKE || !row.MODEL) continue;

    await db.collection("metra_radios").add({
      make: row.MAKE,
      model: row.MODEL,
      trim: row["TRIM/QUALIFIER"] || "",
      yearStart: Number(row["Start Year"]),
      yearEnd: Number(row["End Year"] || row["Start Year"]),

      dashKit: row["DOUBLE DIN"] || row["SINGLE DIN"] || "",
      harness:
        row["INTO CAR"] ||
        row["INTO RADIO"] ||
        row["AMP INTO CAR"] ||
        "",
      antenna: row["ANTENNA ADAPTER"] || "",
    });
  }

  console.log("✅ Metra Sheet 1 imported");
})();
