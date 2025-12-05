// src/components/VehicleFitment.jsx
import React from "react";
import {
  getYearOptions,
  getMakeOptions,
  getModelOptions,
  findFitment,
  getRecommendedProducts,
} from "../utils/fitmentEngine";

// NORMALIZE CATEGORY FOR FILTER BUTTONS
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

export default function VehicleFitment({ onAddProducts }) {
  const [year, setYear] = React.useState("");
  const [make, setMake] = React.useState("");
  const [model, setModel] = React.useState("");

  const [fitment, setFitment] = React.useState(null);
  const [recommended, setRecommended] = React.useState([]);

  const [category, setCategory] = React.useState("All");

  const years = getYearOptions();
  const makes = getMakeOptions(year || null);
  const models = getModelOptions(year || null, make || null);

  // WHEN VEHICLE CHANGES, UPDATE FITMENT + PRODUCTS
  React.useEffect(() => {
  const f = findFitment(
    year ? Number(year) : null,
    make || null,
    model || null
  );

  setFitment(f);

  if (f) {
    const rec = getRecommendedProducts(f) || [];
    setRecommended(rec);

    // ⭐ SAVE SELECTED VEHICLE FOR RECEIPT ⭐
    const selectedVehicle = {
      year: Number(year),
      make: f.make,
      model: f.model,
      trim: f.trim || "",
      body: f.body || "",
      radio: f.radio || null,
    };

    console.log("Saving vehicle:", selectedVehicle); // DEBUG
    localStorage.setItem("selectedVehicle", JSON.stringify(selectedVehicle));
  } else {
    setRecommended([]);
    localStorage.removeItem("selectedVehicle");
  }
}, [year, make, model]);


  // CATEGORY FILTER
  const filteredRecommended =
    category === "All"
      ? recommended
      : recommended.filter(
          (p) => normalizeCategory(p.category) === category
        );

  // CLICK ANY PRODUCT TO ADD TO CART
  const handleClickProduct = (product) => {
    if (onAddProducts) onAddProducts([product]);
  };

  // ADD ALL PRODUCTS
  const handleAddAll = () => {
    if (onAddProducts && filteredRecommended.length > 0) {
      onAddProducts(filteredRecommended);
    }
  };

  return (
    <div className="space-y-3 border p-3 rounded-lg bg-gray-50">
      <h3 className="text-md font-semibold">Vehicle Fitment</h3>

      {/* SELECTORS */}
      <div className="grid grid-cols-3 gap-2">
        <select
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            setMake("");
            setModel("");
          }}
          className="border rounded px-2 py-1 text-sm bg-white"
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={make}
          onChange={(e) => {
            setMake(e.target.value);
            setModel("");
          }}
          disabled={!year}
          className="border rounded px-2 py-1 text-sm bg-white"
        >
          <option value="">Make</option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={!make}
          className="border rounded px-2 py-1 text-sm bg-white"
        >
          <option value="">Model</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
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
            <div className="text-[11px] mt-1">
              <div>Dash kit: {fitment.radio.dashKit || "—"}</div>
              <div>Harness: {fitment.radio.harness || "—"}</div>
              <div>Antenna: {fitment.radio.antennaAdapter || "—"}</div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500">
          Select year, make, and model to view fitment.
        </p>
      )}

      {/* CATEGORY FILTER BUTTONS */}
      {fitment && (
        <div className="flex flex-wrap gap-2 pt-1">
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

      {/* PRODUCT LIST */}
      {fitment && (
        <div className="space-y-1">
          <div className="flex justify-between items-center pt-1">
            <span className="text-xs font-semibold text-gray-700">
              Recommended Parts ({filteredRecommended.length})
            </span>

            <button
              className="text-xs px-2 py-1 rounded bg-blue-600 text-white disabled:bg-gray-300"
              onClick={handleAddAll}
              disabled={filteredRecommended.length === 0}
            >
              Add All
            </button>
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
                  onClick={() => handleClickProduct(p)}
                  className="px-2 py-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-100"
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-[11px] text-gray-500">
                    {p.sku} · {p.category}
                    {p.size ? ` · ${p.size}` : ""}
                  </div>
                  <div className="font-semibold text-[11px] mt-1">
                    ${p.price.toFixed(2)}
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