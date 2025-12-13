import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function normalize(str = "") {
  return str.toLowerCase().trim();
}

function groupSpeakers(rows) {
  const groups = {
    front: [],
    rear: [],
    dash: [],
    center: [],
    pillar: [],
    deck: [],
    subwoofers: [],
    other: [],
  };

  for (const s of rows) {
    const loc = normalize(s.location);

    if (loc.includes("sub")) groups.subwoofers.push(s);
    else if (loc.includes("dash")) groups.dash.push(s);
    else if (loc.includes("center")) groups.center.push(s);
    else if (loc.includes("pillar") || loc.includes("a-pillar") || loc.includes("b-pillar"))
      groups.pillar.push(s);
    else if (loc.includes("deck")) groups.deck.push(s);
    else if (loc.includes("rear")) groups.rear.push(s);
    else if (loc.includes("front") || loc.includes("door"))
      groups.front.push(s);
    else groups.other.push(s);
  }

  return groups;
}

export async function loadVehicleFitment({ year, make, model }) {
  // --- METRA SPEAKERS ---
  const speakerQ = query(
    collection(db, "fitment"),
    where("make", "==", make),
    where("model", "==", model),
    where("yearStart", "<=", year),
    where("yearEnd", ">=", year)
  );

  const speakerSnap = await getDocs(speakerQ);
  const speakerRows = speakerSnap.docs.map(d => d.data());

  // --- MAESTRO ---
  const maestroQ = query(
    collection(db, "maestro"),
    where("make", "==", make),
    where("model", "==", model),
    where("yearStart", "<=", year),
    where("yearEnd", ">=", year)
  );

  const maestroSnap = await getDocs(maestroQ);
  const maestro = maestroSnap.docs[0]?.data() || null;

  return {
    speakers: groupSpeakers(speakerRows),
    maestro,
  };
}
