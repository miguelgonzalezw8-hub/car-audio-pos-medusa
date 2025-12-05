// src/App.jsx
import React from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";

// Pages
import Sell from "./pages/Sell";
import Settings from "./pages/Settings";
import ReceiptEditor from "./pages/ReceiptEditor";
import ReceiptPrint from "./pages/ReceiptPrint"; // <-- IMPORT FIXED

// Simple placeholder pages you can replace later:
function Dashboard() {
  return <h1 className="text-2xl font-bold">Dashboard</h1>;
}

function Inventory() {
  return <h1 className="text-2xl font-bold">Inventory</h1>;
}

function Customers() {
  return <h1 className="text-2xl font-bold">Customers</h1>;
}

function Vehicles() {
  return <h1 className="text-2xl font-bold">Vehicles / Fitment</h1>;
}

// Sidebar Navigation Items
const navItems = [
  { name: "Dashboard", path: "/" },
  { name: "Sell", path: "/sell" },
  { name: "Inventory", path: "/inventory" },
  { name: "Customers", path: "/customers" },
  { name: "Vehicles", path: "/vehicles" },
  { name: "Settings", path: "/settings" },
];

export default function App() {
  const location = useLocation();

  // Hide sidebar and header when printing receipts
  const hideLayout = location.pathname === "/print-receipt";

  return (
    <div className={`min-h-screen flex ${hideLayout ? "" : "bg-gray-100"}`}>

      {/* SIDEBAR (hidden on receipt page) */}
      {!hideLayout && (
        <aside className="w-60 bg-white border-r border-gray-200 p-4">
          <h1 className="text-lg font-bold mb-4">Sound Depot</h1>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col">

        {/* TOP BAR (hidden on receipt page) */}
        {!hideLayout && (
          <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4">
            <span className="text-sm text-gray-600">Logged in as Miguel</span>
          </header>
        )}

        {/* PAGE CONTENT */}
        <main className={`flex-1 ${hideLayout ? "" : "p-6"}`}>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/vehicles" element={<Vehicles />} />

            {/* Settings + Receipt Editor */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/receipt" element={<ReceiptEditor />} />

            {/* Receipt Print Page (no sidebar/header) */}
            <Route path="/print-receipt" element={<ReceiptPrint />} />
          </Routes>

        </main>
      </div>
    </div>
  );
}