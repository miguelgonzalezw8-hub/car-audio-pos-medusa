import React from "react";
import { Link } from "react-router-dom";

export default function Settings() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Link
        to="/settings/receipt"
        className="block p-4 bg-blue-600 text-white rounded-lg w-64"
      >
        Receipt Editor
      </Link>
    </div>
  );
}
