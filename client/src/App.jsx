// src/App.jsx
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./components/Login";
import React, { useState, useEffect } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import Sell from "./pages/Sell";
import Inventory from "./pages/Inventory";
import Settings from "./pages/Settings";
import ReceiptEditor from "./pages/ReceiptEditor";
import ReceiptPrint from "./pages/ReceiptPrint";
import ProductCheckIn from "./pages/ProductCheckIn";

// Simple placeholder for now
function Dashboard() {
  return (
    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
      Dashboard
    </div>
  );
}

const navItems = [
  { label: "Dashboard", to: "/" },
  { label: "Sell", to: "/sell" },
  { label: "Inventory", to: "/inventory" },
  { label: "Settings", to: "/settings" },
];
const [user, setUser] = useState(null);
const [authReady, setAuthReady] = useState(false);

export default function App() {
  const location = useLocation();
  const hideLayout = location.pathname === "/print-receipt";
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setAuthReady(true);
  });

  return () => unsubscribe();
}, []);

  // ✅ GLOBAL DARK MODE STATE (read once)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // ✅ APPLY DARK MODE TO <html>
  useEffect(() => {
    const html = document.documentElement;

    if (darkMode) {
      html.classList.add("dark");
      html.setAttribute("data-theme", "dark");
    } else {
      html.classList.remove("dark");
      html.setAttribute("data-theme", "light");
    }

    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);
if (!authReady) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
      Loading...
    </div>
  );
}

if (!user) {
  return <Login />;
}


  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950">
      {/* ================= SIDEBAR ================= */}
      {!hideLayout && (
        <aside className="w-60 bg-slate-900 text-slate-100 flex flex-col">
          <div className="px-4 py-5 border-b border-slate-800">
            <div className="text-lg font-semibold tracking-tight">
              Sound Depot POS
            </div>
            <div className="text-xs text-slate-400">
              Car Audio · Fitment · Sales
            </div>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
      )}

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        {!hideLayout && (
          <header className="h-14 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {location.pathname === "/sell"
                ? "Sell"
                : location.pathname === "/inventory"
                ? "Inventory"
                : location.pathname.startsWith("/settings")
                ? "Settings"
                : "Dashboard"}
            </span>
          </header>
        )}

        {/* PAGE CONTENT */}
        <main className={`flex-1 ${hideLayout ? "" : "p-6"}`}>
          <Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/sell" element={<Sell />} />
  <Route path="/inventory" element={<Inventory />} />
  <Route path="/inventory/check-in" element={<ProductCheckIn />} />

  {/* ✅ MUST COME FIRST */}
  <Route
  path="/settings/receipt"
  element={<ReceiptEditor key="receipt-editor" />}
/>


  <Route
    path="/settings"
    element={<Settings darkMode={darkMode} setDarkMode={setDarkMode} />}
  />

  <Route
  path="/print-receipt"
  element={<ReceiptPrint key="receipt-print" />}
/>
</Routes>

        </main>
      </div>
    </div>
  );
}
