// src/pages/Inventory.jsx
import React, { useState, useEffect } from "react";
import "./Inventory.css";

import AddProductModal from "../components/AddProductModal";
import AddBrandModal from "../components/AddBrandModal"; // ✅ ONLY import once

// FIREBASE IMPORTS
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  // -----------------------------
  // SAVE PRODUCT
  // -----------------------------
  const handleSaveProduct = async (product) => {
    try {
      if (editingItem) {
        await updateDoc(doc(db, "inventory", editingItem.id), {
          ...product,
          cost: Number(product.cost) || 0,
          price: Number(product.price) || 0,
          stock: Number(product.stock) || 0,
          updatedAt: serverTimestamp(),
        });

        alert("Product updated!");
        setEditingItem(null);
      } else {
        await addDoc(collection(db, "inventory"), {
          ...product,
          cost: Number(product.cost) || 0,
          price: Number(product.price) || 0,
          stock: Number(product.stock) || 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        alert("Product added!");
      }

      setModalOpen(false);
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Failed to save product.");
    }
  };

  // -----------------------------
  // SAVE BRAND
  // -----------------------------
  const handleSaveBrand = async (brand) => {
    try {
      await addDoc(collection(db, "brands"), {
        ...brand,
        createdAt: serverTimestamp(),
      });

      alert("Brand added!");
      setBrandModalOpen(false);
    } catch (err) {
      console.error("Brand save error:", err);
      alert("Failed to save brand.");
    }
  };

  // -----------------------------
  // DELETE PRODUCT
  // -----------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteDoc(doc(db, "inventory", id));
      alert("Product deleted.");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete product.");
    }
  };

  // -----------------------------
  // READ INVENTORY LIVE
  // -----------------------------
  useEffect(() => {
    const q = query(collection(db, "inventory"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(data);
    });

    return () => unsubscribe();
  }, []);

  // -----------------------------
  // RENDER UI
  // -----------------------------
  return (
    <div className="inventory-container">

      {/* HEADER */}
      <div className="inventory-header">
        <h1>Inventory</h1>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="add-btn" onClick={() => setBrandModalOpen(true)}>
            + Add Brand
          </button>

          <button className="add-btn" onClick={() => setModalOpen(true)}>
            + Add Product
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="search-row">
        <input
          className="search-box"
          placeholder="Search by name, brand, SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Cost</th>
              <th>Price</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 20 }}>
                  No products yet.
                </td>
              </tr>
            ) : (
              items
                .filter((i) =>
                  `${i.name} ${i.brand} ${i.sku}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                .map((item) => (
                  <tr key={item.id}>
                    <td>{item.sku}</td>
                    <td>{item.name}</td>
                    <td>{item.brand}</td>
                    <td>{item.category}</td>
                    <td>${item.cost?.toFixed(2)}</td>
                    <td>${item.price?.toFixed(2)}</td>
                    <td>{item.stock}</td>

                    <td className="actions-col">
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditingItem(item);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* PRODUCT MODAL */}
      <AddProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveProduct}
        editingItem={editingItem}
      />

      {/* BRAND MODAL */}
      <AddBrandModal
        isOpen={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
        onSave={handleSaveBrand}
      />
    </div>
  );
}
