// src/components/AddProductModal.jsx
import React, { useState, useEffect } from "react";
import "./AddProductModal.css";

export default function AddProductModal({ isOpen, onClose, onSave, editingItem }) {
  const [form, setForm] = useState({
    sku: "",
    name: "",
    brand: "",
    category: "",
    cost: "",
    price: "",
    stock: "",
  });

  // Load existing product when editing
  useEffect(() => {
    if (editingItem) {
      setForm({
        sku: editingItem.sku || "",
        name: editingItem.name || "",
        brand: editingItem.brand || "",
        category: editingItem.category || "",
        cost: editingItem.cost || "",
        price: editingItem.price || "",
        stock: editingItem.stock || "",
      });
    } else {
      // Reset form when adding new product
      setForm({
        sku: "",
        name: "",
        brand: "",
        category: "",
        cost: "",
        price: "",
        stock: "",
      });
    }
  }, [editingItem]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()} // stop closing modal
      >
        <h2 className="modal-title">
          {editingItem ? "Edit Product" : "Add Product"}
        </h2>

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
            {editingItem ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
