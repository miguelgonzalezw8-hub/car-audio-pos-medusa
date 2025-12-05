// src/pages/Sell.jsx
import React, { useState } from "react";
import VehicleFitment from "../components/VehicleFitment";
import CheckoutModal from "../components/CheckoutModal";

export default function Sell() {
  // PRODUCT SEARCH
  const [search, setSearch] = useState("");

  // CART STATE
  const [cart, setCart] = useState([]);

  // CUSTOMER STATE
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

  // CHECKOUT MODAL
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // TEMPORARY CUSTOMER DATA (Replace with Firebase later)
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
            `${c.first} ${c.last}`
              .toLowerCase()
              .includes(customerSearch.toLowerCase()) ||
            c.phone.includes(customerSearch)
        );

  // PRODUCT LIST (DEMO)
  const products = [
    { id: 1, name: `Pioneer 6.5" Coaxial Speakers`, sku: "TS-A652F", price: 89.99, barcode: "123456", serial: "PN-001" },
    { id: 2, name: `Pioneer 12" Subwoofer`, sku: "TS-W312D4", price: 129.99, barcode: "789012", serial: "PW-002" },
    { id: 3, name: `Hertz 6x9" Speakers`, sku: "HZX690", price: 199.99, barcode: "345678", serial: "HZ-003" },
    { id: 4, name: `Rockford Fosgate Mono Amp`, sku: "R500X1D", price: 229.99, barcode: "901234", serial: "RF-004" },
    { id: 5, name: "Metra Dash Kit", sku: "95-6511", price: 29.99, barcode: "567890", serial: "MT-005" },
  ];

  const filteredProducts =
    search.trim().length === 0
      ? []
      : products.filter(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase()) ||
            (p.barcode && p.barcode.includes(search)) ||
            (p.serial && p.serial.toLowerCase().includes(search.toLowerCase()))
        );

  // ============================
  // CART FUNCTIONS
  // ============================
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const addMultipleToCart = (items) => {
    items.forEach((item) => addToCart(item));
  };

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // ============================
  // TOTALS
  // ============================
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const taxRate = selectedCustomer?.type === "Wholesale" ? 0 : 0.095;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // ============================
  // UI LAYOUT
  // ============================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* LEFT SIDE — VEHICLE FITMENT */}
      <VehicleFitment onAddProducts={addMultipleToCart} />

      {/* RIGHT SIDE — POS PANEL */}
      <div className="bg-white p-4 rounded-xl shadow border border-gray-200 space-y-4">

        {/* SEARCH BAR */}
        <input
          type="text"
          placeholder="Search products, barcode, or serial..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
        />

        {/* SEARCH RESULTS */}
        {search.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded bg-gray-50">
            {filteredProducts.length === 0 ? (
              <p className="text-gray-500 text-sm">No matching products.</p>
            ) : (
              filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="p-3 border rounded-lg hover:bg-gray-100 cursor-pointer flex justify-between"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      SKU: {p.sku} · SN: {p.serial}
                    </p>
                  </div>
                  <p className="font-semibold">${p.price.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* CUSTOMER PANEL */}
        <div className="space-y-2 border p-3 rounded-lg bg-gray-50">
          <h3 className="text-md font-semibold">Customer</h3>

          {selectedCustomer ? (
            <div className="flex justify-between items-center bg-white p-2 rounded-lg border">
              <div>
                <p className="font-medium">
                  {selectedCustomer.first} {selectedCustomer.last}
                </p>
                <p className="text-xs text-gray-500">{selectedCustomer.phone}</p>
                <p className="text-xs text-blue-600">{selectedCustomer.type}</p>
              </div>

              <button
                className="text-red-500 text-sm"
                onClick={() => setSelectedCustomer(null)}
              >
                Clear
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Search customers by name or phone..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              />

              {customerSearch.length > 0 && (
                <div className="max-h-40 overflow-y-auto border rounded-lg bg-white">
                  {filteredCustomers.length === 0 ? (
                    <div className="p-2 text-gray-500 text-sm">
                      No customers found.
                    </div>
                  ) : (
                    filteredCustomers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCustomerSearch("");
                        }}
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                      >
                        <p className="font-medium">
                          {c.first} {c.last}
                        </p>
                        <p className="text-xs text-gray-500">{c.phone}</p>
                        <p className="text-xs">{c.type}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              <button
                className="w-full mt-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => setShowNewCustomerForm(true)}
              >
                Add New Customer
              </button>
            </>
          )}
        </div>

        {/* CART */}
        <div>
          <h2 className="text-xl font-semibold">Cart</h2>

          {cart.length === 0 ? (
            <div className="text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg p-6 text-center">
              Cart is empty.
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="border-b pb-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>

                    <span className="font-semibold">{item.qty}</span>

                    <button
                      onClick={() => increaseQty(item.id)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>

                    <p className="font-semibold w-20 text-right">
                      ${(item.qty * item.price).toFixed(2)}
                    </p>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TOTALS */}
          <div className="border-t pt-4 space-y-2 text-gray-800">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* CHECKOUT BUTTON */}
          <button
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={() => setCheckoutOpen(true)}
          >
            Checkout
          </button>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
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