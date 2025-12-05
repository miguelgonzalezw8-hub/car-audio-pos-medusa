import React, { useState } from "react";
import "./ReceiptEditor.css";

export default function ReceiptEditor() {
  const [storeName, setStoreName] = useState("Sound Depot");
  const [phone, setPhone] = useState("256-555-0000");
  const [address, setAddress] = useState("Madison, AL");
  const [accentColor, setAccentColor] = useState("#007aff");
  const [receiptType, setReceiptType] = useState("thermal");
  const [warranty, setWarranty] = useState("All products carry a 1-year warranty. Installation warranty: 60 days.");
  const [footer, setFooter] = useState("Thank you for choosing Sound Depot!");
  const [logo, setLogo] = useState(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const saveSettings = () => {
    const data = {
      storeName,
      phone,
      address,
      accentColor,
      receiptType,
      warranty,
      footer,
      logo,
    };

    // Later we send this into Firebase
    localStorage.setItem("receiptSettings", JSON.stringify(data));

    alert("Receipt settings saved!");
  };

  return (
    <div className="receipt-editor">

      <h1>Receipt Editor</h1>

      {/* STORE INFO */}
      <div className="card">
        <h2>Store Info</h2>

        <label>Store Name</label>
        <input value={storeName} onChange={(e) => setStoreName(e.target.value)} />

        <label>Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />

        <label>Address</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      {/* LOGO UPLOAD */}
      <div className="card">
        <h2>Logo</h2>

        {logo ? (
          <img src={logo} alt="Logo" className="logo-preview" />
        ) : (
          <p className="placeholder">No logo uploaded</p>
        )}

        <input type="file" onChange={handleLogoUpload} />
      </div>

      {/* RECEIPT STYLE */}
      <div className="card">
        <h2>Receipt Style</h2>

        <label>Format</label>
        <select
          value={receiptType}
          onChange={(e) => setReceiptType(e.target.value)}
        >
          <option value="thermal">Thermal (80mm)</option>
          <option value="letter">Full Page Letter</option>
        </select>

        <label>Accent Color</label>
        <input
          type="color"
          value={accentColor}
          onChange={(e) => setAccentColor(e.target.value)}
        />
      </div>

      {/* WARRANTY SECTION */}
      <div className="card">
        <h2>Warranty Policy</h2>
        <textarea
          value={warranty}
          onChange={(e) => setWarranty(e.target.value)}
        />
      </div>

      {/* FOOTER TEXT */}
      <div className="card">
        <h2>Footer Message</h2>
        <textarea
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
        />
      </div>

      <button className="save-btn" onClick={saveSettings}>Save Settings</button>
    </div>
  );
}
