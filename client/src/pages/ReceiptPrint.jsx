// src/pages/ReceiptPrint.jsx
import React from "react";
import "./ReceiptPrint.css";

export default function ReceiptPrint() {
  const receipt = JSON.parse(localStorage.getItem("currentReceipt"));
  const settings = JSON.parse(localStorage.getItem("receiptSettings")) || {};

  if (!receipt) return null;

  // Format Date/Time
  const dateObj = new Date(receipt.date);
  const dateStr = dateObj.toLocaleDateString();
  const timeStr = dateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Totals
  const subtotal = receipt.subtotal ?? 0;
  const tax = receipt.tax ?? 0;
  const discount = receipt.discount ?? 0;
  const total = receipt.total ?? subtotal + tax;
  const taxRate = subtotal > 0 ? ((tax / subtotal) * 100).toFixed(2) : "0.00";

  // Optional extra totals
  const parts = receipt.partsTotal ?? null;
  const labor = receipt.laborTotal ?? null;
  const shopFees = receipt.shopFees ?? null;
  const otherFees = receipt.otherFees ?? null;

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // SMS handler
  const handleTextReceipt = () => {
    if (!receipt.customer?.phone) {
      alert("No phone number on file for this customer.");
      return;
    }
    alert(`Receipt sent via text to ${receipt.customer.phone}`);
    // TODO: hook up SMS API here
  };

  // Email handler
  const handleEmailReceipt = () => {
    if (!receipt.customer?.email) {
      alert("No email on file for this customer.");
      return;
    }
    alert(`Receipt emailed to ${receipt.customer.email}`);
    // TODO: hook up email API here
  };

  // Close handler – always go back to POS screen
  const handleClose = () => {
    // change "/sell" to whatever your POS route is if different
    window.location.href = "/sell";
  };

  return (
    <div className="receipt-overlay" onClick={handleClose}>
      <div
        className="receipt-modal"
        onClick={(e) => e.stopPropagation()} // don't close when clicking inside
      >

        {/* TOP BUTTON BAR (non-printable) */}
        <div className="non-printable modal-buttons">
          {/* CLOSE */}
          <button
            className="btn close-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          >
            ✕
          </button>

          {/* PRINT */}
          <button className="btn print-btn" onClick={handlePrint}>
            Print
          </button>

          {/* TEXT RECEIPT */}
          <button className="btn sms-btn" onClick={handleTextReceipt}>
            Text Receipt
          </button>

          {/* EMAIL RECEIPT */}
          <button className="btn email-btn" onClick={handleEmailReceipt}>
            Email Receipt
          </button>
        </div>

        {/* PRINT AREA */}
        <div id="receipt-print-area" className="receipt-page">
          {/* LOGO */}
          <div className="header-block">
            {settings.logo && (
              <img
                src={settings.logo}
                alt="Logo"
                className="logo-img"
              />
            )}
          </div>

          {/* TOP INFO */}
          <div className="top-info-row">
            <div>
              <div className="label">Receipt Number:</div>
              <div className="value">{receipt.id || receipt.workOrderId}</div>
            </div>
            <div>
              <div className="label">Date:</div>
              <div className="value">{dateStr}</div>
            </div>
            <div>
              <div className="label">Time:</div>
              <div className="value">{timeStr}</div>
            </div>
          </div>

          {/* FROM / TO */}
          <div className="from-to-section">
            <div>
              <div className="section-title">From:</div>
              <div>{settings.storeName}</div>
              <div>{settings.address}</div>
              <div>{settings.phone}</div>
              {settings.email && <div>{settings.email}</div>}
            </div>

            <div>
              <div className="section-title">To:</div>
              {receipt.customer ? (
                <>
                  <div>
                    {receipt.customer.first} {receipt.customer.last}
                  </div>
                  <div>{receipt.customer.phone}</div>
                  <div>{receipt.customer.email}</div>
                </>
              ) : (
                <div>Walk-in Customer</div>
              )}
            </div>
          </div>

          {/* VEHICLE */}
          <div className="vehicle-section">
            <div className="section-title">Vehicle:</div>
            {receipt.vehicle ? (
              <>
                <div>
                  {receipt.vehicle.year} {receipt.vehicle.make}{" "}
                  {receipt.vehicle.model} ({receipt.vehicle.trim})
                </div>
                {receipt.vehicle.vin && <div>VIN: {receipt.vehicle.vin}</div>}
              </>
            ) : (
              <div>No vehicle recorded</div>
            )}
          </div>

          {/* ITEMS */}
          <div className="items-title">Item/Service Description:</div>

          <table className="items-table">
            <thead>
              <tr>
                <th>Item #</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{String(idx + 1).padStart(2, "0")}</td>
                  <td>
                    <div className="desc-main">{item.name}</div>
                    {item.sku && (
                      <div className="desc-sub">SKU: {item.sku}</div>
                    )}
                  </td>
                  <td>{item.qty}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>${(item.qty * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* BOTTOM TOTALS + PAYMENT */}
          <div className="bottom-section">
            {/* Payment */}
            <div className="payment-block">
              <div className="label">Payment Method:</div>
              <div className="value">
                {receipt.paymentMethod?.toUpperCase()}
              </div>
              {receipt.paymentMethod === "cash" && (
                <>
                  <div className="value">
                    Cash Given: ${receipt.cashGiven?.toFixed(2)}
                  </div>
                  <div className="value">
                    Change Due: ${receipt.changeDue?.toFixed(2)}
                  </div>
                </>
              )}
            </div>

            {/* Totals */}
            <div className="totals-block">
              {parts !== null && (
                <div className="totals-row">
                  <span>Parts:</span>
                  <span>${parts.toFixed(2)}</span>
                </div>
              )}
              {labor !== null && (
                <div className="totals-row">
                  <span>Labor:</span>
                  <span>${labor.toFixed(2)}</span>
                </div>
              )}
              {shopFees !== null && (
                <div className="totals-row">
                  <span>Shop Fees:</span>
                  <span>${shopFees.toFixed(2)}</span>
                </div>
              )}
              {otherFees !== null && (
                <div className="totals-row">
                  <span>Other Fees:</span>
                  <span>${otherFees.toFixed(2)}</span>
                </div>
              )}

              <div className="totals-row">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span>Discount:</span>
                <span>${discount.toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span>Tax ({taxRate}%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="totals-row grand-total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* NOTES */}
          {receipt.notes && (
            <div className="notes-block">
              <div className="label">Notes:</div>
              <div>{receipt.notes}</div>
            </div>
          )}

          {/* FOOTER */}
          <div className="footer-text">
            {settings.footer || "Thank you for choosing Sound Depot!"}
          </div>
        </div>
      </div>
    </div>
  );
}
