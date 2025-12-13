export function interpretSpeakers(doc) {
  const out = [];

  function push(group, pos, item) {
    if (!item) return;

    out.push({
      zone: item.location,
      size: normalize(item.size),
      position: `${group} ${pos}`,
    });
  }

  [1,2,3].forEach(n => {
    push("Front", n, doc.front?.[`l${n}`]);
    push("Rear", n, doc.rear?.[`l${n}`]);
  });

  return out;
}

function normalize(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^0-9.x]/g, "")
    .replace(" ", "");
}
