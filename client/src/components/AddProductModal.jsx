// src/components/AddProductModal.jsx
import React, { useState, useEffect } from "react";
import "./AddProductModal.css";

import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";

export default function AddProductModal({
  isOpen,
  onClose,
  onSave,
  editingItem
}) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    brand: "",
    subBrand: "",
    category: "",
    cost: "",
    price: "",
    stock: ""
  });

  const [brands, setBrands] = useState([]);
  const [subbrands, setSubbrands] = useState([]);
  const [showSubbrand, setShowSubbrand] = useState(false);

  // ---------------------------------
  // Load brands from Firestore
  // ---------------------------------
  useEffect(() => {
    const q = query(collection(db, "brands"), orderBy("brandName"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setBrands(list);
    });

    return () => unsubscribe();
  }, []);

  // ---------------------------------
  // Preload form when editing
  // ---------------------------------
  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name || "",
        sku: editingItem.sku || "",
        brand: editingItem.brand || "",
        subBrand: editingItem.subBrand || "",
        category: editingItem.category || "",
        cost: editingItem.cost || "",
        price: editingItem.price || "",
        stock: editingItem.stock || ""
      });

      const brand = brands.find(b => b.brandName === editingItem.brand);
      if (brand?.enableSubbrands) {
        setSubbrands(brand.subbrands || []);
        setShowSubbrand(true);
      } else {
        setShowSubbrand(false);
      }
    } else {
      setForm({
        name: "",
        sku: "",
        brand: "",
        subBrand: "",
        category: "",
        cost: "",
        price: "",
        stock: ""
      });
      setShowSubbrand(false);
    }
  }, [editingItem, brands]);

  // ---------------------------------
  // Handle brand change
  // ---------------------------------
  const handleBrandChange = (value) => {
    setForm(prev => ({
      ...prev,
      brand: value,
      subBrand: ""
    }));

    const brand = brands.find(b => b.brandName === value);

    if (brand && brand.enableSubbrands) {
      setSubbrands(brand.subbrands || []);
      setShowSubbrand(true);
    } else {
      setSubbrands([]);
      setShowSubbrand(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">
          {editingItem ? "Edit Product" : "Add Product"}
        </h2>

        <div className="modal-grid">
          <input
            name="sku"
            placeholder="SKU"
            value={form.sku}
            onChange={handleChange}
          />

          <input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
          />

          {/* BRAND DROPDOWN */}
          <select
            value={form.brand}
            onChange={(e) => handleBrandChange(e.target.value)}
          >
            <option value="">Select Brand</option>
            {brands.map(b => (
              <option key={b.id} value={b.brandName}>
                {b.brandName}
              </option>
            ))}
          </select>

          {/* SUB-BRAND DROPDOWN (conditional) */}
          {showSubbrand && (
            <select
              name="subBrand"
              value={form.subBrand}
              onChange={handleChange}
            >
              <option value="">Select Sub-Brand</option>
              {subbrands.map((sb, i) => (
                <option key={i} value={sb}>
                  {sb}
                </option>
              ))}
            </select>
          )}

          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
          />

          <input
            type="number"
            name="cost"
            placeholder="Cost"
            value={form.cost}
            onChange={handleChange}
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
          />

          <input
            type="number"
            name="stock"
            placeholder="Stock Qty"
            value={form.stock}
            onChange={handleChange}
          />
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button className="save-btn" onClick={handleSubmit}>
            {editingItem ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
