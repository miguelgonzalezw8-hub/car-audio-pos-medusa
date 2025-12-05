// src/App.jsx
import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";

// Pages
import Sell from "./pages/Sell";

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

function Settings() {
  return <h1 className="text-2xl font-bold">Settings</h1>;
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
  return (
    <div className="min-h-screen flex bg-gray-100">
      
      {/* SIDEBAR */}
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

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">

        {/* TOP BAR */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4">
          <span className="text-sm text-gray-600">
            Logged in as Miguel
          </span>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
