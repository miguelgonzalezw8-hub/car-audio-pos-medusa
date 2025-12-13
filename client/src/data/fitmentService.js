import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { interpretSpeakers } from "../utils/fitmentInterpreter";
import { matchProducts } from "../utils/fitmentMatcher";

export async function getFitment(year, make, model, products) {
  const q = query(
    collection(db, "metra_speakers"),
    where("make", "==", make),
    where("model", "==", model),
    where("yearStart", "<=", year),
    where("yearEnd", ">=", year)
  );

  const snap = await getDocs(q);
  if (snap.empty) return [];

  const doc = snap.docs[0].data();
  const speakers = interpretSpeakers(doc);

  return matchProducts(products, speakers, doc.subwoofers);
}
