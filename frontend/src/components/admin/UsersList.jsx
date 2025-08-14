import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import AddUserModal from "./AddUserModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import "../../styles/UsersList.css";
import ErrorBanner from "../common/ErrorBanner"; // ⬅️ new

export default function UsersList() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);

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

  const handleDeleteClick = (userId) => {
    setDeleteUserId(userId);
  };

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

  return (
    <div className="users-list-wrapper">
        <ErrorBanner message={error} onClose={() => setError("")} /> {/* ⬅️ here */}<div className="users-list-header">
        <h2>Users</h2>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
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
        <div className="users-list">
          <div className="list-header">
            <span>ID</span>
            <span>Name</span>
            <span>Username</span>
            <span>Role</span>
            <span>Actions</span>
          </div>

          {users.map((u) => (
            <div className="list-row" key={u.id}>
              <span>{u.id}</span>
              <span>{u.name}</span>
              <span>{u.username}</span>
              <span>{u.role}</span>
              <span className="actions">
                <button className="edit-btn" onClick={() => handleEditClick(u)}>
                  Edit
                </button>
                <button className="delete-btn" onClick={() => handleDeleteClick(u.id)}>
                  Delete
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
