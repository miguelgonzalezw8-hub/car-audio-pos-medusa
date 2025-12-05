// src/components/AddProductModal.jsx
import React, { useState } from "react";
import "./AddProductModal.css";

export default function AddProductModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    sku: "",
    name: "",
    brand: "",
    category: "",
    cost: "",
    price: "",
    stock: "",
  });

  if (!isOpen) return null;

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.name || !form.price) {
      alert("Name and price are required.");
      return;
    }

    onSave(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">Add Product</h2>

        <div className="modal-grid">
          <input
            placeholder="SKU"
            value={form.sku}
            onChange={(e) => update("sku", e.target.value)}
          />

          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />

          <input
            placeholder="Brand"
            value={form.brand}
            onChange={(e) => update("brand", e.target.value)}
          />

          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">Category</option>
            <option>Speakers</option>
            <option>Subwoofers</option>
            <option>Amplifiers</option>
            <option>DSP</option>
            <option>Installation</option>
            <option>Accessories</option>
            <option>Other</option>
          </select>

          <input
            type="number"
            placeholder="Cost"
            value={form.cost}
            onChange={(e) => update("cost", e.target.value)}
          />

          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />

          <input
            type="number"
            placeholder="Stock Qty"
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button className="save-btn" onClick={handleSave}>
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
}
