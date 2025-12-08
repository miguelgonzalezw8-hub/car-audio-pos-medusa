import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  doc,
  serverTimestamp,
} from "firebase/firestore";

/* ================= CONFIG ================= */

const INSTALLER_TYPES = [
  "Basic",
  "Custom",
  "Remote Start / Alarm",
  "Tint",
  "Lighting",
  "Mechanical",
  "Marine",
];

const MECP_CERTS = [
  "MECP Basic",
  "MECP Advanced",
  "MECP Master",
];

/* ================= PAGE ================= */

export default function Installers() {
  const [installers, setInstallers] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  /* ADD FORM */
  const [name, setName] = useState("");
  const [types, setTypes] = useState([]);
  const [certEnabled, setCertEnabled] = useState(false);
  const [certs, setCerts] = useState([]);
  const [selectedCert, setSelectedCert] = useState("");

  const [payModel, setPayModel] = useState("hourly");
  const [hourlyRate, setHourlyRate] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("");
  const [rentDue, setRentDue] = useState("");
  const [flatRate, setFlatRate] = useState("");

  /* ================= LOAD ================= */
  useEffect(() => {
    return onSnapshot(collection(db, "installers"), (snap) =>
      setInstallers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const selectedInstaller = installers.find(
    (i) => i.id === selectedId
  );

  /* ================= SAVE ================= */

  const resetForm = () => {
    setName("");
    setTypes([]);
    setCertEnabled(false);
    setCerts([]);
    setSelectedCert("");
    setPayModel("hourly");
    setHourlyRate("");
    setCommissionPercent("");
    setRentDue("");
    setFlatRate("");
  };

  const addInstaller = async () => {
    if (!name) return alert("Installer name required");

    await addDoc(collection(db, "installers"), {
      name,
      types,
      certifications: certEnabled ? certs : [],
      payModel,
      hourlyRate: payModel === "hourly" ? Number(hourlyRate) : null,
      commissionPercent:
        payModel === "commission" ? Number(commissionPercent) : null,
      rentDue:
        payModel === "commission" ? Number(rentDue) : null,
      flatRate: payModel === "flat" ? Number(flatRate) : null,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    resetForm();
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-5xl space-y-6">

      <h1 className="text-2xl font-bold">Installers</h1>

      {/* ================= ADD INSTALLER ================= */}
      <div className="bg-white dark:bg-slate-900 border rounded-xl p-5 space-y-4">

        <h2 className="font-semibold">Add Installer</h2>

        <input
          placeholder="Installer Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        {/* TYPES */}
        <div className="grid grid-cols-2 gap-2">
          {INSTALLER_TYPES.map((t) => (
            <label key={t} className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={types.includes(t)}
                onChange={() =>
                  setTypes((prev) =>
                    prev.includes(t)
                      ? prev.filter((x) => x !== t)
                      : [...prev, t]
                  )
                }
              />
              {t}
            </label>
          ))}
        </div>

        {/* CERTS */}
        <div className="space-y-2">
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={certEnabled}
              onChange={() => setCertEnabled(!certEnabled)}
            />
            MECP Certified
          </label>

          {certEnabled && (
            <>
              <div className="flex gap-2">
                <select
                  value={selectedCert}
                  onChange={(e) => setSelectedCert(e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="">Select certification</option>
                  {MECP_CERTS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    if (
                      selectedCert &&
                      !certs.includes(selectedCert)
                    ) {
                      setCerts([...certs, selectedCert]);
                    }
                  }}
                  className="px-3 py-2 border rounded"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {certs.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* PAY MODEL */}
        <select
          value={payModel}
          onChange={(e) => setPayModel(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="hourly">Hourly Labor</option>
          <option value="commission">Commission</option>
          <option value="flat">Flat Rate</option>
        </select>

        {payModel === "hourly" && (
          <input
            type="number"
            placeholder="Hourly Rate"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        )}

        {payModel === "commission" && (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Commission %"
              value={commissionPercent}
              onChange={(e) => setCommissionPercent(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Monthly Rent Due"
              value={rentDue}
              onChange={(e) => setRentDue(e.target.value)}
              className="border px-3 py-2 rounded"
            />
          </div>
        )}

        {payModel === "flat" && (
          <input
            type="number"
            placeholder="Flat Rate per Job"
            value={flatRate}
            onChange={(e) => setFlatRate(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        )}

        <button
          onClick={addInstaller}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add Installer
        </button>
      </div>

      {/* ================= SELECT / VIEW ================= */}
      <div className="bg-white dark:bg-slate-900 border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold">Existing Installers</h2>

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">Select installer</option>
          {installers.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>

        {selectedInstaller && (
          <div className="text-sm text-gray-600 space-y-1">
            <div>Pay Model: {selectedInstaller.payModel}</div>
            {selectedInstaller.hourlyRate && (
              <div>Hourly: ${selectedInstaller.hourlyRate}</div>
            )}
            {selectedInstaller.commissionPercent && (
              <div>
                Commission: {selectedInstaller.commissionPercent}%
              </div>
            )}
            {selectedInstaller.rentDue && (
              <div>Rent Due: ${selectedInstaller.rentDue}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
