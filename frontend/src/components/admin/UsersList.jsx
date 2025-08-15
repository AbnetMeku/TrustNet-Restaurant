import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import AddUserModal from "./AddUserModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ErrorBanner from "../common/ErrorBanner";

export default function UsersList() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const roleColors = {
    admin: "bg-red-100 text-red-800",
    manager: "bg-blue-100 text-blue-800",
    waiter: "bg-green-100 text-green-800",
    kitchen: "bg-yellow-100 text-yellow-800",
    butcher: "bg-purple-100 text-purple-800",
    bar: "bg-pink-100 text-pink-800",
    cashier: "bg-indigo-100 text-indigo-800",
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSaved = (savedUser) => {
    const exists = users.find((u) => u.id === savedUser.id);
    if (exists) {
      setUsers((prev) =>
        prev.map((u) => (u.id === savedUser.id ? savedUser : u))
      );
    } else {
      setUsers((prev) => [...prev, savedUser]);
    }
    setShowAddModal(false);
    setEditingUser(null);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setShowAddModal(true);
  };

  const handleDeleteClick = (userId) => setDeleteUserId(userId);

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/users/${deleteUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserId));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeleteUserId(null);
    }
  };

  const cancelDelete = () => setDeleteUserId(null);

  const filteredUsers = users
    .filter((u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((u) => (filterRole ? u.role === filterRole : true));

  return (
    <div className="p-4">
      <ErrorBanner message={error} onClose={() => setError("")} />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="waiter">Waiter</option>
            <option value="kitchen">Kitchen</option>
            <option value="butcher">Butcher</option>
            <option value="bar">Bar</option>
            <option value="cashier">Cashier</option>
          </select>
        </div>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-semibold"
          onClick={() => setShowAddModal(true)}
        >
          + Add User
        </button>
      </div>

      {showAddModal && (
        <AddUserModal
          userToEdit={editingUser}
          onUserAdded={handleUserSaved}
          onClose={() => {
            setShowAddModal(false);
            setEditingUser(null);
          }}
        />
      )}

      {deleteUserId && (
        <DeleteConfirmationModal
          message="Are you sure you want to delete this user?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Username</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Role</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 text-sm text-gray-700">{u.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{u.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{u.username}</td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${roleColors[u.role] || "bg-gray-100 text-gray-800"}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-right space-x-2">
                    <button
                      onClick={() => handleEditClick(u)}
                      className="text-indigo-600 hover:text-indigo-900 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(u.id)}
                      className="text-red-600 hover:text-red-900 font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
