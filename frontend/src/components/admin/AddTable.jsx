// frontend/src/components/admin/AddTable.jsx
import React, { useState } from "react";

export default function AddTable() {
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ tableNumber, capacity });
    // Backend API call here
  };

  return (
    <div className="bg-white shadow p-6 rounded-lg max-w-lg">
      <h2 className="text-2xl font-bold mb-4">Add Table</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          placeholder="Table Number"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="number"
          placeholder="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save
        </button>
      </form>
    </div>
  );
}
