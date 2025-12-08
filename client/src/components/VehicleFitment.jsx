import { useState, useEffect } from "react";
import {
  getYearOptions,
  getMakeOptions,
  getModelOptions,
  findFitment,
  getRecommendedProducts,
} from "../utils/fitmentEngine";

/* ============================================================
   NORMALIZE CATEGORY
============================================================ */
function normalizeCategory(cat = "") {
  const c = cat.toLowerCase();

  if (
    c.includes("speaker") ||
    c.includes("front") ||
    c.includes("rear") ||
    c.includes("tweeter") ||
    c.includes("component") ||
    c.includes("coax")
  )
    return "Speakers";

  if (c.includes("sub") || c.includes("woofer")) return "Subwoofers";
  if (c.includes("amp")) return "Amplifiers";

  if (
    c.includes("dash") ||
    c.includes("kit") ||
    c.includes("harness") ||
    c.includes("adapter") ||
    c.includes("interface") ||
    c.includes("mount")
  )
    return "Install";

  return "Other";
}

/* ============================================================
   COMPONENT
============================================================ */
export default function VehicleFitment({
  onAddProduct,
  onVehicleSelected,
}) {
  /* ============================ */
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  const [fitment, setFitment] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [category, setCategory] = useState("All");

  const years = getYearOptions();
  const makes = getMakeOptions(year || null);
  const models = getModelOptions(year || null, make || null);

  /* ============================
     RESOLVE FITMENT
  ============================ */
  useEffect(() => {
    const f = findFitment(
      year ? Number(year) : null,
      make || null,
      model || null
    );

    setFitment(f || null);

    if (f) {
      const parts = getRecommendedProducts(f) || [];
      setRecommended(parts);

      onVehicleSelected?.({
        year: Number(year),
        make: f.make,
        model: f.model,
        trim: f.trim || "",
        body: f.body || "",
        speakers: f.speakers || {},
        radio: f.radio || null,
        raw: f,
      });
    } else {
      setRecommended([]);
      onVehicleSelected?.(null);
    }
  }, [year, make, model]);

  /* ============================
     FILTER RECOMMENDED
  ============================ */
  const filteredRecommended =
    category === "All"
      ? recommended
      : recommended.filter(
          (p) => normalizeCategory(p.category) === category
        );

  /* ============================
     UI
  ============================ */
  return (
    <div className="space-y-3 border p-3 rounded-lg bg-gray-50">
      <h3 className="text-md font-semibold">Vehicle Fitment</h3>

      {/* VEHICLE SELECTORS */}
<div className="grid grid-cols-3 gap-2">

  {/* YEAR */}
  <div className="relative">
    <select
      value={year}
      onChange={(e) => {
        setYear(e.target.value);
        setMake("");
        setModel("");
      }}
      className="w-full h-11 px-3 pr-8 rounded-lg border border-gray-300 bg-white text-sm appearance-none pr-10
                 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600">
      <option value="">Select Year</option>
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
      ▼
    </div>
  </div>

  {/* MAKE */}
  <div className="relative">
    <select
      value={make}
      onChange={(e) => {
        setMake(e.target.value);
        setModel("");
      }}
      disabled={!year}
      className="w-full h-11 px-3 pr-8 rounded-lg border border-gray-300 bg-white text-sm appearance-none pr-10
                 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600
                 disabled:bg-gray-100 disabled:text-gray-400"
    >
      <option value="">Select Make</option>
      {makes.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
      ▼
    </div>
  </div>

  {/* MODEL */}
  <div className="relative">
    <select
      value={model}
      onChange={(e) => setModel(e.target.value)}
      disabled={!make}
      className="w-full h-11 px-3 pr-8 rounded-lg border border-gray-300 bg-white text-sm appearance-none pr-10
                 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600
                 disabled:bg-gray-100 disabled:text-gray-400"
    >
      <option value="">Select Model</option>
      {models.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
      ▼
    </div>
  </div>

</div>



      {/* VEHICLE SUMMARY */}
      {fitment ? (
        <div className="text-xs text-gray-700 bg-white border rounded p-2 space-y-1">
          <div className="font-semibold">
            {year} {fitment.make} {fitment.model}
          </div>
          <div>
            {fitment.trim} · {fitment.body}
          </div>

          {fitment.radio && (
            <div className="text-[11px] mt-1 space-y-0.5">
              <div>Dash kit: {fitment.radio.dashKit || "—"}</div>
              <div>Harness: {fitment.radio.harness || "—"}</div>
              <div>
                Antenna: {fitment.radio.antennaAdapter || "—"}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500">
          Select year, make, and model to view fitment.
        </p>
      )}

      {/* CATEGORY FILTER */}
      {fitment && (
        <div className="flex flex-wrap gap-2">
          {[
            "All",
            "Speakers",
            "Subwoofers",
            "Amplifiers",
            "Install",
            "Other",
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 border rounded text-xs ${
                category === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* RECOMMENDED PRODUCTS */}
      {fitment && (
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-700">
              Recommended Parts ({filteredRecommended.length})
            </span>
          </div>

          {filteredRecommended.length === 0 ? (
            <p className="text-xs text-gray-500">
              No parts found for this category.
            </p>
          ) : (
            <ul className="max-h-40 overflow-y-auto text-xs bg-white border rounded">
              {filteredRecommended.map((p) => (
                <li
                  key={p.id}
                  onMouseDown={() => onAddProduct?.(p)}
                  className="px-2 py-2 border-b cursor-pointer hover:bg-gray-100"
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-[11px] text-gray-500">
                    {p.sku} · {p.category}
                    {p.size ? ` · ${p.size}` : ""}
                  </div>
                  <div className="font-semibold text-[11px] mt-1">
                    ${Number(p.price).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
