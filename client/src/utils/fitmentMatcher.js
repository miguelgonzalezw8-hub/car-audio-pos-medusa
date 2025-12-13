export function matchProducts(products, speakers, subs) {
  const matches = [];

  for (const p of products) {
    if (p.category === "Speakers") {
      for (const s of speakers) {
        if (normalize(p.speakerSize) === s.size) {
          matches.push({ product: p, fit: s });
        }
      }
    }

    if (p.category === "Subwoofers" && subs) {
      matches.push({ product: p, fit: "sub" });
    }
  }

  return matches;
}

function normalize(v) {
  return (v || "").replace(/[^0-9.x]/gi, "");
}
