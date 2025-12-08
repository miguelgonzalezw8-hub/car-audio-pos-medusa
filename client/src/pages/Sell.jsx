import { useState, useEffect } from "react";
import VehicleFitment from "../components/VehicleFitment";
import CheckoutModal from "../components/CheckoutModal";
import { db } from "../firebase";

import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

/* ================= PHONE FORMAT ================= */
const formatPhone = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

export default function Sell() {
  /* ================= CORE STATE ================= */
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [installer, setInstaller] = useState(null);

  const [appointment, setAppointment] = useState({
    date: null,
    startTime: "",
    endTime: "",
  });

  /* ================= DATA ================= */
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  /* ================= SEARCH ================= */
  const [search, setSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  /* ================= CART ================= */
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  /* ================= ADD CUSTOMER ================= */
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    type: "Retail",
  });

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    const q = query(collection(db, "products"), where("active", "==", true));
    return onSnapshot(q, (snap) =>
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  /* ================= LOAD CUSTOMERS ================= */
  useEffect(() => {
    const q = query(collection(db, "customers"));
    return onSnapshot(q, (snap) =>
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  /* ================= FILTERS ================= */
  const filteredProducts =
    search.trim() === ""
      ? []
      : products.filter((p) =>
          `${p.name} ${p.sku || ""} ${p.barcode || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
        );

  const filteredCustomers =
    customerSearch.trim() === ""
      ? []
      : customers.filter((c) =>
          `${c.firstName || ""} ${c.lastName || ""} ${c.phone || ""} ${c.email || ""}`
            .toLowerCase()
            .includes(customerSearch.toLowerCase())
        );

  /* ================= CART LOGIC ================= */
  const addToCart = (product, source = "search") => {
    setCart((prev) => [
      ...prev,
      {
        cartId: crypto.randomUUID(),
        productId: product.id,
        name: product.name,
        sku: product.sku || "",
        price: Number(product.price || 0),
        qty: 1,
        source,
        serialNumbers: source === "fitment" ? [] : null,
      },
    ]);
    if (source === "search") setSearch("");
  };

  const addSerial = (cartId, sn) => {
    setCart((prev) =>
      prev.map((i) =>
        i.cartId === cartId
          ? { ...i, serialNumbers: [...i.serialNumbers, sn] }
          : i
      )
    );
  };

  /* ================= TOTALS ================= */
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const taxRate = selectedCustomer?.type === "Wholesale" ? 0 : 0.095;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  /* ================= SAVE CUSTOMER ================= */
  const saveCustomer = async () => {
    const ref = await addDoc(collection(db, "customers"), {
      ...newCustomer,
      phoneRaw: newCustomer.phone.replace(/\D/g, ""),
      createdAt: serverTimestamp(),
    });

    setSelectedCustomer({ id: ref.id, ...newCustomer });
    setCustomerSearch("");
    setShowAddCustomer(false);
  };

  /* ================= SAVE QUOTE ================= */
  const saveQuote = async (print) => {
    const payload = {
      type: "quote",
      createdAt: serverTimestamp(),
      customer: selectedCustomer,
      vehicle: selectedVehicle,
      items: cart,
      totals: { subtotal, tax, total },
      installer,
      appointment,
    };

    const ref = await addDoc(collection(db, "quotes"), payload);

    if (print) {
      localStorage.setItem(
        "currentReceipt",
        JSON.stringify({ ...payload, id: ref.id })
      );
      window.location.href = "/print-receipt";
    }
  };

  /* ================= COMPLETE SALE ================= */
  const completeSale = async (payment) => {
    const payload = {
      type: "sale",
      status: "completed",
      createdAt: serverTimestamp(),
      customer: selectedCustomer,
      vehicle: selectedVehicle,
      payment,
      items: cart,
      totals: { subtotal, tax, total },
      installer,
      appointment,
    };

    const ref = await addDoc(collection(db, "sales"), payload);

    localStorage.setItem(
      "currentReceipt",
      JSON.stringify({ ...payload, id: ref.id })
    );

    setCart([]);
    setCheckoutOpen(false);
    window.location.href = "/print-receipt";
  };

  /* ================= UI ================= */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <VehicleFitment
        onVehicleSelected={setSelectedVehicle}
        onAddProduct={(p) => addToCart(p, "fitment")}
      />

      <div className="bg-white p-4 rounded-xl shadow border flex flex-col">

        {/* PRODUCT SEARCH */}
        <div className="relative">
          <input
            placeholder="Search or scan product…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border
                       focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          {search && (
            <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto
                            rounded-lg border bg-white shadow">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onMouseDown={() => addToCart(p)}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">
                    {p.sku} · ${Number(p.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CUSTOMER SEARCH */}
        <div className="mt-4 relative">
          <input
            placeholder="Search customer…"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border
                       focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          {filteredCustomers.length > 0 && (
            <div className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto
                            rounded-lg border bg-white shadow">
              {filteredCustomers.map((c) => (
                <div
                  key={c.id}
                  onMouseDown={() => {
                    setSelectedCustomer(c);
                    setCustomerSearch("");
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                >
                  <div className="font-medium">
                    {c.firstName} {c.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {c.phone} {c.email && `· ${c.email}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowAddCustomer(true)}
            className="mt-2 w-full h-11 rounded-lg border font-semibold"
          >
            ➕ Add Customer
          </button>
        </div>

        {selectedCustomer && (
          <div className="mt-3 rounded-lg border bg-blue-50 p-3 text-sm">
            👤 <strong>{selectedCustomer.firstName} {selectedCustomer.lastName}</strong>
            {selectedCustomer.phone && ` · ${selectedCustomer.phone}`}
            {selectedCustomer.email && ` · ${selectedCustomer.email}`}
            <button
              onClick={() => setSelectedCustomer(null)}
              className="ml-2 text-red-600 text-xs"
            >
              Remove
            </button>
          </div>
        )}

        {/* CART */}
        <div className="flex-1 mt-4 overflow-y-auto border-t pt-2">
          {cart.map((i) => (
            <div key={i.cartId} className="border-b py-2 text-sm">
              <div className="flex justify-between">
                <span>{i.name}</span>
                <span>${(i.price * i.qty).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* TOTALS */}
        <div className="border-t pt-3 space-y-3">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            onClick={() => setCheckoutOpen(true)}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
          >
            ✅ Checkout
          </button>
        </div>
      </div>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        subtotal={subtotal}
        taxRate={taxRate}
        total={total}
        onCompletePayment={completeSale}
      />
    </div>
  );
}
