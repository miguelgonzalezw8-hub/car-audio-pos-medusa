// src/pages/Sell.jsx
import React, { useState } from "react";
import VehicleFitment from "../components/VehicleFitment";
import CheckoutModal from "../components/CheckoutModal";

export default function Sell() {
  // ============================
  // VEHICLE STATE
  // ============================
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // ============================
  // PRODUCT SEARCH
  // ============================
  const [search, setSearch] = useState("");

  // ============================
  // CART STATE
  // ============================
  const [cart, setCart] = useState([]);

  // ============================
  // CUSTOMER STATE
  // ============================
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

  // ============================
  // CHECKOUT MODAL
  // ============================
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // ============================
  // TEMP CUSTOMER DATA
  // ============================
  const customers = [
    { id: 1, first: "John", last: "Doe", phone: "256-555-1212", type: "Retail" },
    { id: 2, first: "Maria", last: "Sanchez", phone: "256-222-8899", type: "Wholesale" },
    { id: 3, first: "Adam", last: "Walker", phone: "256-777-4545", type: "Retail" },
  ];

  const filteredCustomers =
    customerSearch.trim().length === 0
      ? []
      : customers.filter(
          (c) =>
            `${c.first} ${c.last}`.toLowerCase().includes(customerSearch.toLowerCase()) ||
            c.phone.includes(customerSearch)
        );

  // ============================
  // DEMO PRODUCTS (REPLACE W/ FIREBASE LATER)
  // ============================
  const products = [
    { id: 1, name: `Pioneer 6.5" Coaxial Speakers`, sku: "TS-A652F", price: 89.99, size: "6.5 coaxial", category: "Speakers" },
    { id: 2, name: `Pioneer 12" Subwoofer`, sku: "TS-W312D4", price: 129.99, size: "12", category: "Subwoofer" },
    { id: 3, name: `Hertz 6x9" Speakers`, sku: "HZX690", price: 199.99, size: "6x9 coaxial", category: "Speakers" },
    { id: 4, name: `Rockford Fosgate Mono Amp`, sku: "R500X1D", price: 229.99, category: "Amplifier" },
    { id: 5, name: "Metra Dash Kit", sku: "95-6511", price: 29.99, category: "Dash Kit" },
  ];

  // ============================
  // FITMENT HELPERS
  // ============================
  const normalizeSpeakerSize = (value = "") => {
    const v = value.toLowerCase();
    if (v.includes("6.5") || v.includes("6 1/2")) return "6.5";
    if (v.includes("6x9") || v.includes("6 x 9")) return "6x9";
    if (v === "1" || v.includes('1"')) return "1";
    return null;
  };

  const getVehicleSpeakerSizes = (vehicle) => {
    if (!vehicle?.speakers) return [];

    return [
      ...(vehicle.speakers.front || []),
      ...(vehicle.speakers.rear || []),
      ...(vehicle.speakers.other || [])
    ]
      .map((s) => normalizeSpeakerSize(s.size))
      .filter(Boolean);
  };

  const productFitsVehicle = (product, vehicle) => {
    if (!vehicle) return false;

    // Speakers must match speaker sizes
    if (product.category === "Speakers") {
      const productSize = normalizeSpeakerSize(product.size);
      if (!productSize) return false;
      return getVehicleSpeakerSizes(vehicle).includes(productSize);
    }

    // Everything else is universal for now
    return true;
  };

  // ============================
  // FILTERED PRODUCTS
  // ============================
  const filteredProducts =
    search.trim().length === 0 || !selectedVehicle
      ? []
      : products.filter(
          (p) =>
            productFitsVehicle(p, selectedVehicle) &&
            (
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.sku.toLowerCase().includes(search.toLowerCase())
            )
        );

  // ============================
  // CART FUNCTIONS
  // ============================
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  // ============================
  // TOTALS
  // ============================
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const taxRate = selectedCustomer?.type === "Wholesale" ? 0 : 0.095;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // ============================
  // UI
  // ============================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* VEHICLE FITMENT */}
      <VehicleFitment onVehicleSelected={setSelectedVehicle} />

      {/* POS PANEL */}
      <div className="bg-white p-4 rounded-xl shadow border border-gray-200 space-y-4">

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          disabled={!selectedVehicle}
        />

        {search.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded bg-gray-50">
            {filteredProducts.length === 0 ? (
              <p className="text-gray-500 text-sm">
                {selectedVehicle
                  ? "No compatible products found."
                  : "Select a vehicle first."}
              </p>
            ) : (
              filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="p-3 border rounded-lg hover:bg-gray-100 cursor-pointer flex justify-between"
                >
                  <p className="font-medium">{p.name}</p>
                  <p className="font-semibold">${p.price.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* CART */}
        <div>
          <h2 className="text-xl font-semibold">Cart</h2>

          {cart.length === 0 ? (
            <div className="text-gray-500 text-sm border border-dashed rounded-lg p-6 text-center">
              Cart is empty.
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between border-b py-2">
                <span>{item.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => decreaseQty(item.id)}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => increaseQty(item.id)}>+</button>
                  <button onClick={() => removeItem(item.id)} className="text-red-500">
                    Remove
                  </button>
                </div>
              </div>
            ))
          )
        }</div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between"><span>Total:</span><span>${total.toFixed(2)}</span></div>
        </div>

        <button
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
          onClick={() => setCheckoutOpen(true)}
        >
          Checkout
        </button>
      </div>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        customer={selectedCustomer}
        onComplete={(receipt) => {
          localStorage.setItem("currentReceipt", JSON.stringify(receipt));
          window.location.href = "/print-receipt";
        }}
      />
    </div>
  );
}
