import React, { useState } from "react";
import "./ProductCheckIn.css";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import "./ProductCheckIn.css";
import { db } from "../firebase";

export default function ProductCheckIn() {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState(null);
  const [units, setUnits] = useState([
    { cost: "", serial: "" },
  ]);
  const [loading, setLoading] = useState(false);

  /* ===============================
     FIND MASTER PRODUCT BY BARCODE
     =============================== */
  const handleBarcodeScan = async (e) => {
    if (e.key !== "Enter") return;

    setLoading(true);
    setProduct(null);

    const q = query(
      collection(db, "products"),
      where("barcode", "==", barcode),
      limit(1)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      alert("No product found for this barcode.");
      setLoading(false);
      return;
    }

    const doc = snap.docs[0];
    setProduct({ id: doc.id, ...doc.data() });
    setLoading(false);
  };

  /* ===============================
     HANDLE UNIT INPUT
     =============================== */
  const updateUnit = (index, key, value) => {
    setUnits((prev) =>
      prev.map((u, i) =>
        i === index ? { ...u, [key]: value } : u
      )
    );
  };

  const addUnitRow = () => {
    setUnits((prev) => [...prev, { cost: "", serial: "" }]);
  };

  const removeUnitRow = (index) => {
    setUnits((prev) => prev.filter((_, i) => i !== index));
  };

  /* ===============================
     FIFO BACKORDER ASSIGNMENT
     =============================== */
  const assignBackordersFIFO = async (productId, unitRefId) => {
    const q = query(
      collection(db, "backorders"),
      where("productId", "==", productId),
      where("status", "==", "open"),
      orderBy("createdAt", "asc"),
      limit(1)
    );

    const snap = await getDocs(q);
    if (snap.empty) return false;

    const backorderDoc = snap.docs[0];

    await updateDoc(backorderDoc.ref, {
      status: "fulfilled",
      fulfilledAt: serverTimestamp(),
    });

    await updateDoc(
      doc(db, "productUnits", unitRefId),
      {
        status: "reserved",
        backorderId: backorderDoc.id,
      }
    );

    return true;
  };

  /* ===============================
     SAVE CHECK-IN
     =============================== */
  const handleSave = async () => {
    if (!product) return;
    if (units.some((u) => !u.cost)) {
      alert("Each unit must have a cost.");
      return;
    }

    setLoading(true);

    for (const u of units) {
      const unitRef = await addDoc(collection(db, "productUnits"), {
        productId: product.id,
        barcode: product.barcode,
        cost: Number(u.cost),
        serial: u.serial || null,
        status: "in_stock",
        receivedAt: serverTimestamp(),
      });

      /* ✅ FIFO BACKORDER ASSIGN */
      await assignBackordersFIFO(product.id, unitRef.id);
    }

    alert("Product check-in complete!");
    setBarcode("");
    setProduct(null);
    setUnits([{ cost: "", serial: "" }]);
    setLoading(false);
  };

  /* ===============================
     UI
     =============================== */
  return (
    <div className="checkin-container">
      <h1>📥 Product Check-In</h1>

      {/* BARCODE SCAN */}
      <input
        className="scan-input"
        placeholder="Scan or enter product barcode"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onKeyDown={handleBarcodeScan}
        autoFocus
        disabled={loading}
      />

      {/* PRODUCT SUMMARY */}
      {product && (
        <div className="product-summary">
          <strong>{product.name}</strong>
          <div>SKU: {product.sku || "—"}</div>
          <div>Sell Price: ${product.price.toFixed(2)}</div>
        </div>
      )}

      {/* UNIT ENTRY */}
      {product && (
        <div className="unit-list">
          <h3>Units Received</h3>

          {units.map((u, i) => (
            <div className="unit-row" key={i}>
              <input
                type="number"
                placeholder="Cost"
                value={u.cost}
                onChange={(e) =>
                  updateUnit(i, "cost", e.target.value)
                }
              />

              <input
                placeholder="Serial (optional)"
                value={u.serial}
                onChange={(e) =>
                  updateUnit(i, "serial", e.target.value)
                }
              />

              {units.length > 1 && (
                <button
                  className="remove-btn"
                  onClick={() => removeUnitRow(i)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button className="add-row-btn" onClick={addUnitRow}>
            + Add Another Unit
          </button>
        </div>
      )}

      {/* ACTIONS */}
      {product && (
        <div className="actions">
          <button className="save-btn" onClick={handleSave} disabled={loading}>
            ✅ Complete Check-In
          </button>
        </div>
      )}
    </div>
  );
}
