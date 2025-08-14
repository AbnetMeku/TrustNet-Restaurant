import React, { useState } from "react";
import AddMenu from "./AddMenu";

export default function MenuList() {
  const [showAdd, setShowAdd] = useState(false);

  const menuItems = [
    { id: 1, name: "Burger", price: 8.99 },
    { id: 2, name: "Pizza", price: 12.5 },
    { id: 3, name: "Pasta", price: 10 },
  ];

  return (
    <div className="card">
      <h2>Menu Items</h2>
      <p className="muted">Manage the restaurant menu.</p>
      <button className="add-btn" onClick={() => setShowAdd(true)}>+ Add Menu Item</button>

      <ul className="list">
        {menuItems.map(item => (
          <li key={item.id}>
            {item.name} — <span className="muted">${item.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      {showAdd && <AddMenu close={() => setShowAdd(false)} />}
    </div>
  );
}
