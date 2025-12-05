import React, { useEffect } from "react";
import "./ReceiptPrint.css";

export default function ReceiptPrint() {
  const receipt = JSON.parse(localStorage.getItem("currentReceipt"));
  const settings = JSON.parse(localStorage.getItem("receiptSettings")) || {};

  useEffect(() => {
    setTimeout(() => window.print(), 400);
  }, []);

  if (!receipt) return <h2>No receipt found.</h2>;

  return (
    <div className="receipt-wrapper">
      {/* HEADER */}
      <div className="header">
        {settings.logo && (
          <img src={settings.logo} className="logo" alt="Shop Logo" />
        )}

        <h1 className="shop-name">{settings.storeName || "Your Shop"}</h1>

        <p className="shop-info">
          {settings.phone} • {settings.address}
        </p>

        <div className="divider" />

        <p className="meta">
          <strong>Work Order:</strong> {receipt.workOrderId}
        </p>
        <p className="meta">
          <strong>Date:</strong> {new Date(receipt.date).toLocaleString()}
        </p>
        <p className="meta">
          <strong>Receipt ID:</strong> {receipt.id}
        </p>
      </div>

      {/* CUSTOMER INFO */}
      {receipt.customer && (
        <>
          <div className="section-title">Customer</div>
          <div className="box">
            <p>{receipt.customer.first} {receipt.customer.last}</p>
            <p>{receipt.customer.phone}</p>
            {receipt.vehicle && (
              <p>
                {receipt.vehicle.year} {receipt.vehicle.make}{" "}
                {receipt.vehicle.model} ({receipt.vehicle.trim})
              </p>
            )}
          </div>
        </>
      )}

      {/* ITEMS */}
      <div className="section-title">Parts & Labor</div>
      <div className="items-section">
        {receipt.items.map((item, idx) => (
          <div className="item" key={idx}>
            <div className="item-left">
              <p className="item-name">{item.name}</p>
              <p className="item-desc">
                {item.sku && <>SKU: {item.sku} • </>}
                Qty: {item.qty}
              </p>
            </div>
            <p className="item-price">${(item.price * item.qty).toFixed(2)}</p>
          </div>
        ))}

        {receipt.labor && receipt.labor.length > 0 && (
          <>
            <div className="section-title">Labor</div>
            {receipt.labor.map((lab, idx) => (
              <div className="item" key={idx}>
                <div className="item-left">
                  <p className="item-name">{lab.description}</p>
                  <p className="item-desc">
                    {lab.hours} hr @ ${lab.rate}/hr
                  </p>
                </div>
                <p className="item-price">
                  ${(lab.hours * lab.rate).toFixed(2)}
                </p>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="divider" />

      {/* TOTALS */}
      <div className="totals">
        <p><span>Subtotal:</span> ${receipt.subtotal.toFixed(2)}</p>
        <p><span>Tax:</span> ${receipt.tax.toFixed(2)}</p>
        <p className="grand-total">
          <span>Total:</span> ${receipt.total.toFixed(2)}
        </p>

        <p><span>Payment:</span> {receipt.paymentMethod.toUpperCase()}</p>

        {receipt.paymentMethod === "cash" && (
          <>
            <p><span>Cash Given:</span> ${receipt.cashGiven.toFixed(2)}</p>
            <p><span>Change Due:</span> ${receipt.changeDue.toFixed(2)}</p>
          </>
        )}
      </div>

      <div className="divider" />

      {/* NOTES */}
      {receipt.notes && (
        <>
          <div className="section-title">Notes</div>
          <p className="notes">{receipt.notes}</p>
        </>
      )}

      {/* WARRANTY */}
      {settings.warranty && (
        <p className="warranty">{settings.warranty}</p>
      )}

      {/* SIGNATURE */}
      <div className="signature-box">
        <p>Customer Signature:</p>
        <div className="signature-line"></div>
      </div>

      {/* FOOTER */}
      <p className="footer">{settings.footer || "Thank you for your business!"}</p>

      <p className="powered-by">Powered by Sound Depot POS</p>
    </div>
  );
}
