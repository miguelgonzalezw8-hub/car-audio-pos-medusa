// src/pages/Inventory.jsx
import React, { useState } from "react";
import "./Inventory.css";
import AddProductModal from "../components/AddProductModal";  // ⬅ ADD THIS

export default function Inventory() {
  const [search, setSearch] = useState("");

  // ⬅ STATE FOR MODAL
  const [modalOpen, setModalOpen] = useState(false);

  // ⬅ TEMP SAVE HANDLER (Firebase will come next)
  const handleSaveProduct = (product) => {
    console.log("Saving product:", product);
  };

  return (
    <div className="inventory-container">

      {/* HEADER BAR */}
      <div className="inventory-header">
        <h1>Inventory</h1>

        {/* ADD PRODUCT BUTTON */}
        <button
          className="add-btn"
          onClick={() => setModalOpen(true)}   // ⬅ OPEN MODAL
        >
          + Add Product
        </button>
      </div>

      {/* SEARCH BAR */}
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
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: "20px", color: "#777" }}>
                Your inventory will appear here after we connect Firebase.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* MODAL COMPONENT (renders only when modalOpen = true) */}
      <AddProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveProduct}
      />

    </div>
  );
}
