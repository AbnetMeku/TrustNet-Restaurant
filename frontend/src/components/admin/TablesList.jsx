// src/components/admin/TablesList.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchTables, deleteTable } from "../../api/tables";
import AddTableModal from "./AddTableModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ErrorBanner from "../common/ErrorBanner";

export default function TablesList() {
  const { token } = useAuth();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [deleteTableId, setDeleteTableId] = useState(null);

  useEffect(() => {
    fetchAllTables();
  }, [token]);

  const fetchAllTables = async () => {
    try {
      const data = await fetchTables(token);
      setTables(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load tables.");
    } finally {
      setLoading(false);
    }
  };

  const handleTableSaved = (savedTable) => {
    const exists = tables.find((t) => t.id === savedTable.id);
    if (exists) {
      setTables((prev) =>
        prev.map((t) => (t.id === savedTable.id ? savedTable : t))
      );
    } else {
      setTables((prev) => [...prev, savedTable]);
    }
    setShowAddModal(false);
    setEditingTable(null);
  };

  const handleEditClick = (table) => {
    setEditingTable(table);
    setShowAddModal(true);
  };

  const handleDeleteClick = (tableId) => {
    setDeleteTableId(tableId);
  };

  const confirmDelete = async () => {
    try {
      await deleteTable(deleteTableId, token);
      setTables((prev) => prev.filter((t) => t.id !== deleteTableId));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete table.");
    } finally {
      setDeleteTableId(null);
    }
  };

  const cancelDelete = () => setDeleteTableId(null);

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <ErrorBanner message={error} onClose={() => setError("")} />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-800">Tables</h2>
        <button
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-5 py-2 rounded-lg font-medium shadow-md transition-all"
          onClick={() => setShowAddModal(true)}
        >
          + Add Table
        </button>
      </div>

      {showAddModal && (
        <AddTableModal
          tableToEdit={editingTable}
          onTableAdded={handleTableSaved}
          onClose={() => {
            setShowAddModal(false);
            setEditingTable(null);
          }}
        />
      )}

      {deleteTableId && (
        <DeleteConfirmationModal
          message="Are you sure you want to delete this table?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {loading ? (
        <p className="text-gray-500">Loading tables...</p>
      ) : tables.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No tables found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {tables.map((t, idx) => (
            <div
              key={t.id}
              className="bg-white rounded-xl shadow-lg p-5 flex flex-col justify-between hover:shadow-xl transition-shadow"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  Table {t.number}
                </h3>
                <p className="text-gray-600">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      t.status === "occupied" ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {t.status}
                  </span>
                </p>
                <p className="text-gray-600">
                  VIP: <span className="font-semibold">{t.is_vip ? "Yes" : "No"}</span>
                </p>
                <p className="text-gray-600">
                  Waiter: <span className="font-semibold">{t.waiter_name || "-"}</span>
                </p>
              </div>
              <div className="flex justify-between mt-auto">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors w-1/2 mr-2"
                  onClick={() => handleEditClick(t)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors w-1/2 ml-2"
                  onClick={() => handleDeleteClick(t.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
