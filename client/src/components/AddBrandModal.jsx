import React, { useState } from "react";
import "./AddProductModal.css"; // reuses same styles
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AddBrandModal({ isOpen, onClose }) {
  const [brandName, setBrandName] = useState("");
  const [repName, setRepName] = useState("");
  const [repPhone, setRepPhone] = useState("");
  const [repEmail, setRepEmail] = useState("");
  const [enableSubbrands, setEnableSubbrands] = useState(false);
  const [subbrands, setSubbrands] = useState([""]);

  const handleSave = async () => {
    if (!brandName.trim()) return alert("Brand name is required.");

    try {
      await addDoc(collection(db, "brands"), {
        brandName,
        repName,
        repPhone,
        repEmail,
        enableSubbrands,
        subbrands: enableSubbrands ? subbrands.filter(Boolean) : [],
      });

      alert("Brand added!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error adding brand.");
    }
  };

  const updateSubbrand = (index, value) => {
    const list = [...subbrands];
    list[index] = value;
    setSubbrands(list);
  };

  const addSubbrandField = () => {
    setSubbrands([...subbrands, ""]);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add Brand</h2>

        <div className="modal-grid">
          <input
            placeholder="Brand Name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />

          <input
            placeholder="Sales Rep Name"
            value={repName}
            onChange={(e) => setRepName(e.target.value)}
          />

          <input
            placeholder="Sales Rep Phone"
            value={repPhone}
            onChange={(e) => setRepPhone(e.target.value)}
          />

          <input
            placeholder="Sales Rep Email"
            value={repEmail}
            onChange={(e) => setRepEmail(e.target.value)}
          />

          <label style={{ marginTop: "10px" }}>
            <input
              type="checkbox"
              checked={enableSubbrands}
              onChange={() => setEnableSubbrands(!enableSubbrands)}
            />
            &nbsp; Enable Subbrands
          </label>

          {enableSubbrands &&
            subbrands.map((sb, index) => (
              <input
                key={index}
                placeholder={`Subbrand ${index + 1}`}
                value={sb}
                onChange={(e) => updateSubbrand(index, e.target.value)}
              />
            ))}

          {enableSubbrands && (
            <button
              className="add-btn"
              style={{ marginTop: "5px" }}
              onClick={addSubbrandField}
            >
              + Add Subbrand
            </button>
          )}
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button className="save-btn" onClick={handleSave}>
            Save Brand
          </button>
        </div>
      </div>
    </div>
  );
}
