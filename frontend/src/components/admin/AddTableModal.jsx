import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import ErrorBanner from "../common/ErrorBanner";

export default function AddTableModal({ tableToEdit, onTableAdded, onClose }) {
  const { token } = useAuth();
  const [error, setError] = useState("");
  const [number, setNumber] = useState("");
  const [status, setStatus] = useState("available");
  const [isVIP, setIsVIP] = useState(false);
  const [waiterId, setWaiterId] = useState("");
  const [waiters, setWaiters] = useState([]);

  useEffect(() => {
    if (tableToEdit) {
      setNumber(tableToEdit.number);
      setStatus(tableToEdit.status);
      setIsVIP(tableToEdit.is_vip);
      setWaiterId(tableToEdit.waiter_id || "");
    }
    fetchWaiters();
  }, [tableToEdit]);

  const fetchWaiters = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users/", {
        params: { role: "waiter" },
        headers: { Authorization: `Bearer ${token}` },
      });
      setWaiters(res.data);
    } catch (err) {
      console.error("Error fetching waiters:", err);
      setError(err.response?.data?.message || "Failed to fetch waiters.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { number, status, is_vip: isVIP, waiter_id: waiterId };
      let res;
      if (tableToEdit) {
        res = await axios.put(
          `http://localhost:5000/tables/${tableToEdit.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        res = await axios.post("http://localhost:5000/tables/", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onTableAdded(res.data);
      setNumber("");
      setStatus("available");
      setIsVIP(false);
      setWaiterId("");
    } catch (err) {
      console.error("Error saving table:", err);
      setError(err.response?.data?.message || "Failed to save table.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-up relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors text-xl"
        >
          ✕
        </button>

        <h3 className="text-2xl font-semibold mb-4 text-center">
          {tableToEdit ? "Edit Table" : "Add Table"}
        </h3>

        <ErrorBanner message={error} onClose={() => setError("")} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Table Number</label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isVIP}
              onChange={(e) => setIsVIP(e.target.checked)}
              id="vipCheckbox"
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-all"
            />
            <label htmlFor="vipCheckbox" className="font-medium">
              VIP Table
            </label>
          </div>

          <div>
            <label className="block font-medium mb-1">Assign Waiter</label>
            <select
              value={waiterId}
              onChange={(e) => setWaiterId(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              required
            >
              <option value="">Select Waiter</option>
              {waiters.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              {tableToEdit ? "Save Changes" : "Add Table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
