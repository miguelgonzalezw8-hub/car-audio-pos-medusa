import React, { useState, useEffect } from "react";
import "./CheckoutModal.css";

export default function CheckoutModal({ isOpen, onClose, cart, customer, onComplete }) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cashGiven, setCashGiven] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxRate = customer?.type === "Wholesale" ? 0 : 0.095;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Change calculation
  const cashNum = parseFloat(cashGiven) || 0;
  const change = paymentMethod === "cash" ? cashNum - total : 0;

  const isCashValid = paymentMethod !== "cash" || cashNum >= total;

  const handleComplete = () => {
  if (paymentMethod === "cash" && cashNum < total) {
    alert("Cash given is not enough.");
    return;
  }

  // Pull selected vehicle (if any)
  const selectedVehicle = JSON.parse(localStorage.getItem("selectedVehicle"));

  const receipt = {
    id: Date.now().toString(),
    customer: customer || null,
    items: cart,
    subtotal,
    tax,
    total,
    paymentMethod,
    notes,
    cashGiven: paymentMethod === "cash" ? cashNum : null,
    changeDue: paymentMethod === "cash" ? change : null,
    date: new Date().toISOString(),

    // VEHICLE INFO ADDED CLEANLY
    vehicle: selectedVehicle
      ? {
          year: selectedVehicle.year,
          make: selectedVehicle.make,
          model: selectedVehicle.model,
          trim: selectedVehicle.trim || "",
          vin: selectedVehicle.vin || "",
        }
      : null,
  };

  onComplete(receipt);
  onClose();
};

  return (
    <div className="checkout-overlay">
      <div className="checkout-modal">

        {/* HEADER */}
        <h2>Checkout</h2>

        {/* PAYMENT METHOD */}
        <div className="section">
          <label>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="card">Card</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        {/* CASH INPUT */}
        {paymentMethod === "cash" && (
          <div className="section">
            <label>Cash Received</label>
            <input
              type="number"
              value={cashGiven}
              onChange={(e) => setCashGiven(e.target.value)}
              placeholder="Enter cash amount"
            />
            {cashGiven && (
              <p className={change < 0 ? "text-red" : "text-green"}>
                Change Due: ${change.toFixed(2)}
              </p>
            )}
          </div>
        )}

        {/* SUMMARY */}
        <div className="section summary">
          <div className="row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="row">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* NOTES */}
        <div className="section">
          <label>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Installation notes, wiring, warranty info, etc..."
          />
        </div>

        {/* FOOTER BUTTONS */}
        <div className="button-row">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>

          <button
            className="confirm-btn"
            disabled={!isCashValid}
            onClick={handleComplete}
          >
            Complete Sale
          </button>
        </div>
      </div>
    </div>
  );
}