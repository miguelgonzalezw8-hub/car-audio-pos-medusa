// src/App.jsx
import React from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";

import Sell from "./pages/Sell";
import Inventory from "./pages/Inventory";
import Settings from "./pages/Settings";
import ReceiptEditor from "./pages/ReceiptEditor";
import ReceiptPrint from "./pages/ReceiptPrint";

// Simple placeholder for now
function Dashboard() {
  return <h1 className="text-2xl font-bold">Dashboard</h1>;
}

const navItems = [
  { label: "Dashboard", to: "/" },
  { label: "Sell", to: "/sell" },
  { label: "Inventory", to: "/inventory" },
  { label: "Settings", to: "/settings" },
];

export default function App() {
  const location = useLocation();
  const hideLayout = location.pathname === "/print-receipt";

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* LEFT SIDEBAR */}
      {!hideLayout && (
        <aside className="w-60 bg-slate-950 text-slate-50 flex flex-col">
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

      {/* RIGHT SIDE: HEADER + PAGE CONTENT */}
      <div className="flex-1 flex flex-col">
        {!hideLayout && (
          <header className="h-14 flex items-center justify-between px-6 border-b border-slate-200 bg-white">
            <div className="text-sm font-medium text-slate-700">
              {location.pathname === "/sell"
                ? "Sell"
                : location.pathname === "/inventory"
                ? "Inventory"
                : location.pathname.startsWith("/settings")
                ? "Settings"
                : "Dashboard"}
            </div>
          </header>
        )}

        <main className={`flex-1 ${hideLayout ? "" : "p-6"}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/receipt" element={<ReceiptEditor />} />
            {/* Print page uses its own layout (hideLayout=true) */}
            <Route path="/print-receipt" element={<ReceiptPrint />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
