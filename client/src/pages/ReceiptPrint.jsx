import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ReceiptPrint() {
  const [receipt, setReceipt] = useState(null);
  const [template, setTemplate] = useState(null);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const stored = localStorage.getItem("currentReceipt");
    if (stored) setReceipt(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const loadTemplate = async () => {
      const snap = await getDoc(doc(db, "settings", "receiptTemplate"));
      if (snap.exists()) setTemplate(snap.data());
    };
    loadTemplate();
  }, []);

  if (!receipt || !template) return null;

  /* ================= HELPERS ================= */

  const money = (v) => `$${Number(v || 0).toFixed(2)}`;

  // ✅ BULLETPROOF DATE
  let created = new Date();
  if (receipt.createdAt?.seconds) {
    created = new Date(receipt.createdAt.seconds * 1000);
  } else if (receipt.createdAt && !isNaN(Date.parse(receipt.createdAt))) {
    created = new Date(receipt.createdAt);
  }

  const dateStr = created.toLocaleDateString();
  const timeStr = created.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const receiptNumber = receipt.receiptNumber || receipt.id || "—";

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-gray-600/60 flex justify-center items-start pt-10 print:bg-white print:pt-0">
      <div className="bg-white w-[920px] shadow-xl print:shadow-none print:w-full">

        {/* ================= ACTION HEADER (NO OVERLAP) ================= */}
        <div className="flex justify-end gap-2 px-6 py-4 border-b bg-gray-50 print:hidden">
          <button
            onClick={() => window.history.back()}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            ✕
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1 bg-indigo-600 text-white rounded"
          >
            Print
          </button>
          <button className="px-3 py-1 bg-gray-200 rounded">
            Text Receipt
          </button>
          <button className="px-3 py-1 bg-gray-200 rounded">
            Email Receipt
          </button>
        </div>

        {/* ================= RECEIPT BODY ================= */}
        <div className="p-12">

          {/* LOGO */}
          {template.logoUrl && (
            <div className="text-center mb-8">
              <img
                src={template.logoUrl}
                alt="Shop Logo"
                className="mx-auto max-h-24 object-contain"
              />
            </div>
          )}

          {/* HEADER META */}
          <div className="grid grid-cols-3 gap-8 text-sm mb-8">
            <div>
              <div className="font-semibold">Receipt Number</div>
              <div>{receiptNumber}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Date</div>
              <div>{dateStr}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">Time</div>
              <div>{timeStr}</div>
            </div>
          </div>

          {/* FROM / TO */}
          <div className="grid grid-cols-2 gap-8 text-sm border-b pb-6 mb-6">
            <div>
              <div className="font-semibold">From</div>
              <div>{template.shopName}</div>
              <div>{template.address}</div>
              <div>{template.phone}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">To</div>
              <div>
                {receipt.customer?.first
                  ? `${receipt.customer.first} ${receipt.customer.last}`
                  : "Walk-in Customer"}
              </div>
            </div>
          </div>

          {/* VEHICLE */}
          <div className="text-sm border-b pb-3 mb-6">
            <div className="font-semibold">Vehicle</div>
            <div>
              {receipt.vehicle
                ? `${receipt.vehicle.year} ${receipt.vehicle.make} ${receipt.vehicle.model}`
                : "No vehicle recorded"}
            </div>
          </div>

          {/* ITEMS */}
          <div className="mb-8">
            <div className="font-semibold mb-2">
              Item / Service Description
            </div>

            <table className="w-full border-collapse text-sm">
              <thead>
                <tr style={{ background: "#8757b1", color: "white" }}>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-center">Serial</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Unit</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items?.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2 text-center">{item.serial || "—"}</td>
                    <td className="p-2 text-center">{item.qty}</td>
                    <td className="p-2 text-right">{money(item.price)}</td>
                    <td className="p-2 text-right">
                      {money(item.qty * item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTALS */}
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <div className="font-semibold">Payment Method</div>
              <div>{receipt.paymentMethod || "CARD"}</div>
            </div>

            <div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{money(receipt.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>{money(receipt.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{money(receipt.tax)}</span>
              </div>

              <div
                className="flex justify-between mt-3 px-3 py-2 text-white font-bold"
                style={{ background: "#8757b1" }}
              >
                <span>Total</span>
                <span>{money(receipt.total)}</span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="text-center text-sm mt-12">
            {template.footerText || "Thank you for choosing Sound Depot!"}
          </div>
        </div>
      </div>
    </div>
  );
}
