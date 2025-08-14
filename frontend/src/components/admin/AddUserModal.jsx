import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "../../styles/AddUserModal.css";
import ErrorBanner from "../common/ErrorBanner"; 

export default function AddUserModal({ userToEdit, onUserAdded, onClose }) {
  const { token } = useAuth();
  const [error, setError] = useState(""); // 
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("waiter"); // default role
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setUsername(userToEdit.username);
      setRole(userToEdit.role);
    }
  }, [userToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let res;
      if (userToEdit) {
        res = await axios.put(
          `http://localhost:5000/users/${userToEdit.id}`,
          { name, role },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        res = await axios.post(
          "http://localhost:5000/users/",
          { name, username, password, role },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      onUserAdded(res.data);
      setName("");
      setUsername("");
      setPassword("");
      setRole("waiter");
    } catch (err) {
      console.error("Error saving user:", err);
      setError(err.response?.data?.message || "Failed to save user.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <ErrorBanner message={error} onClose={() => setError("")} /> {/* ⬅️ here */}
        <h3>{userToEdit ? "Edit User" : "Add User"}</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          {!userToEdit && (
            <>
              <label>
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
            </>
          )}

          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="waiter">Waiter</option>
              <option value="kitchen">Kitchen</option>
              <option value="butcher">Butcher</option>
              <option value="bar">Bar</option>
              <option value="cashier">Cashier</option>
            </select>
          </label>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {userToEdit ? "Save Changes" : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
