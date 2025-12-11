import { useState, useEffect } from "react";
import {
  getYearOptions,
  getMakeOptions,
  getModelOptions,
  findFitment,
  getRecommendedProducts,
} from "../utils/fitmentEngine";

/* Category normalization for the button row */
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

  if (c.includes("sub")) return "Subwoofers";
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

export default function VehicleFitment({ onAddProduct, onVehicleSelected }) {
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  const [fitment, setFitment] = useState(null);
  const [recommended, setRecommended] = useState([]);

  const [category, setCategory] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [sortMode, setSortMode] = useState("recommended");

  const years = getYearOptions();
  const makes = getMakeOptions(year || null);
  const models = getModelOptions(year || null, make || null);

  /* Load fitment + recommended whenever Y/M/M changes */
  useEffect(() => {
    const f = findFitment(
      year ? Number(year) : null,
      make || null,
      model || null
    );

    setFitment(f || null);

    if (f) {
      getRecommendedProducts(f).then((parts) => {
        setRecommended(Array.isArray(parts) ? parts : []);
      });

      onVehicleSelected?.({
        year: Number(year),
        make: f.make,
        model: f.model,
        trim: f.trim || "",
        body: f.bodyStyle || "",
        speakers: f.speakers || {},
        radio: f.radio || null,
        raw: f,
      });
    } else {
      setRecommended([]);
      onVehicleSelected?.(null);
    }
  }, [year, make, model, onVehicleSelected]);

  const safe = Array.isArray(recommended) ? recommended : [];

  // -------- Build distinct brands + locations from recommended --------
  const brandSet = new Set();
  const locSet = new Set();

  safe.forEach((p) => {
    if (p.brand) brandSet.add(p.brand);
    (p.locations || []).forEach((tag) => {
      if (tag) locSet.add(tag);
    });
  });

  const brandOptions = ["All", ...brandSet];
  const locationOptions = ["All", ...locSet];

  // ---------------- Apply filters ----------------
  let filtered = safe;

  if (category !== "All") {
    filtered = filtered.filter(
      (p) => normalizeCategory(p.category) === category
    );
  }

  // Location + brand filters only apply to Speakers
  if (category === "Speakers" && locationFilter !== "All") {
    filtered = filtered.filter((p) =>
      (p.locations || []).includes(locationFilter)
    );
  }

  if (category === "Speakers" && brandFilter !== "All") {
    filtered = filtered.filter(
      (p) => (p.brand || "").toLowerCase() === brandFilter.toLowerCase()
    );
  }

  // ---------------- Apply sorting ----------------
  const sorted = [...filtered];

  if (sortMode === "low-high") {
    sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  } else if (sortMode === "high-low") {
    sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  } else if (sortMode === "brand-az") {
    sorted.sort((a, b) => (a.brand || "").localeCompare(b.brand || ""));
  } else if (sortMode === "brand-za") {
    sorted.sort((a, b) => (b.brand || "").localeCompare(a.brand || ""));
  }
  // "recommended" keeps original order

  const filteredRecommended = sorted;

  // ---------------- UI ----------------
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
              setCategory("All");
              setLocationFilter("All");
              setBrandFilter("All");
              setSortMode("recommended");
            }}
            className="w-full h-11 px-3 pr-8 rounded-lg border border-gray-300 bg-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          >
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
              setCategory("All");
              setLocationFilter("All");
              setBrandFilter("All");
              setSortMode("recommended");
            }}
            disabled={!year}
            className="w-full h-11 px-3 pr-8 rounded-lg border border-gray-300 bg-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 disabled:bg-gray-100 disabled:text-gray-400"
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
            className="w-full h-11 px-3 pr-8 rounded-lg border border-gray-300 bg-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 disabled:bg-gray-100 disabled:text-gray-400"
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
          {fitment.trim && <div>{fitment.trim}</div>}
        </div>
      ) : (
        <p className="text-xs text-gray-500">
          Select year, make, and model to view fitment.
        </p>
      )}

      {/* ROW 1 — CATEGORY FILTER (always when fitment found) */}
      {fitment && (
        <div className="flex flex-wrap gap-2">
          {["All", "Speakers", "Subwoofers", "Amplifiers", "Install", "Other"].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  // reset secondary filters when switching main category
                  setLocationFilter("All");
                  setBrandFilter("All");
                  setSortMode("recommended");
                }}
                className={`px-3 py-1 border rounded text-xs ${
                  category === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      )}

      {/* ROW 2 — LOCATION FILTER (Speakers only) */}
      {fitment &&
        category === "Speakers" &&
        locationOptions.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {locationOptions.map((loc) => (
              <button
                key={loc}
                onClick={() =>
                  setLocationFilter(loc === "All" ? "All" : loc)
                }
                className={`px-3 py-1 border rounded text-xs ${
                  locationFilter === loc
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                {loc === "All" ? "All Locations" : loc}
              </button>
            ))}
          </div>
        )}

      {/* ROW 3 — BRAND FILTER (Speakers only) */}
      {fitment &&
        category === "Speakers" &&
        brandOptions.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {brandOptions.map((b) => (
              <button
                key={b}
                onClick={() => setBrandFilter(b)}
                className={`px-3 py-1 border rounded text-xs ${
                  brandFilter === b
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                {b === "All" ? "All Brands" : b}
              </button>
            ))}
          </div>
        )}

      {/* SORTING (Speakers only, when more than 1 item) */}
      {fitment &&
        category === "Speakers" &&
        filteredRecommended.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-gray-700">Sort</span>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              className="border rounded px-2 py-1 text-xs bg-white"
            >
              <option value="recommended">Recommended</option>
              <option value="low-high">Price: Low → High</option>
              <option value="high-low">Price: High → Low</option>
              <option value="brand-az">Brand: A → Z</option>
              <option value="brand-za">Brand: Z → A</option>
            </select>
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
              No parts found for this filter.
            </p>
          ) : (
            <ul className="max-h-40 overflow-y-auto text-xs bg-white border rounded">
              {filteredRecommended.map((p) => (
                <li
                  key={p.id || p.sku}
                  onMouseDown={() => onAddProduct?.(p)}
                  className="px-2 py-2 border-b cursor-pointer hover:bg-gray-100"
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-[11px] text-gray-500">
                    {p.sku} · {p.brand || "—"}
                    {p.locations?.length
                      ? ` · ${p.locations.join(", ")}`
                      : ""}
                  </div>
                  <div className="font-semibold text-[11px] mt-1">
                    ${Number(p.price || 0).toFixed(2)}
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
