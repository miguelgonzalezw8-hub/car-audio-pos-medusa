import { useEffect, useState } from "react";
import {
  getYearOptions,
  getMakeOptions,
  getModelOptions,
  findVehicleFitment,
} from "../data/vehicleFitment";

export default function VehicleFitment({ onVehicleSelected }) {
  const [years, setYears] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);

  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  /* LOAD YEARS */
  useEffect(() => {
    getYearOptions().then((y) => {
      console.log("Years loaded:", y.length);
      setYears(y);
    });
  }, []);

  /* LOAD MAKES */
  useEffect(() => {
    if (!year) return;

    setMake("");
    setModel("");
    setModels([]);

    getMakeOptions(Number(year)).then(setMakes);
  }, [year]);

  /* LOAD MODELS */
  useEffect(() => {
    if (!year || !make) return;

    setModel("");
    getModelOptions(Number(year), make).then(setModels);
  }, [year, make]);

  /* EMIT VEHICLE */
  useEffect(() => {
    if (!year || !make || !model) {
      onVehicleSelected?.(null);
      return;
    }

    findVehicleFitment(Number(year), make, model).then((fitment) => {
      onVehicleSelected?.({
        year: Number(year),
        make,
        model,
        fitment,
      });
    });
  }, [year, make, model, onVehicleSelected]);

  return (
    <div className="space-y-3 border p-4 rounded-lg bg-gray-50">
      <div className="grid grid-cols-3 gap-2">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border rounded px-2 py-1"
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
          onChange={(e) => setMake(e.target.value)}
          disabled={!year}
          className="border rounded px-2 py-1"
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
          className="border rounded px-2 py-1"
        >
          <option value="">Model</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {!year || !make || !model ? (
        <div className="text-sm text-gray-500 text-center">
          Select a vehicle
        </div>
      ) : null}
    </div>
  );
}
