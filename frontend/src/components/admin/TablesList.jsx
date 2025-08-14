import React, { useState } from "react";
import AddTable from "./AddTable";

export default function TablesList() {
  const [showAdd, setShowAdd] = useState(false);

  const tables = [
    { id: 1, name: "Table 1", seats: 4 },
    { id: 2, name: "Table 2", seats: 2 },
    { id: 3, name: "Table 3", seats: 6 },
  ];

  return (
    <div className="card">
      <h2>Tables</h2>
      <p className="muted">Manage all tables in the restaurant.</p>
      <button className="add-btn" onClick={() => setShowAdd(true)}>+ Add Table</button>

      <ul className="list">
        {tables.map(table => (
          <li key={table.id}>
            {table.name} — <span className="muted">{table.seats} seats</span>
          </li>
        ))}
      </ul>

      {showAdd && <AddTable close={() => setShowAdd(false)} />}
    </div>
  );
}
