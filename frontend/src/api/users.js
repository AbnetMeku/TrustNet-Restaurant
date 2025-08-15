// src/api/users.js
import axios from "axios";

/**
 * Fetch all users.
 * Optional role filter: ?role=waiter
 * Returns array of user objects.
 */
export const fetchUsers = async (token, role = "") => {
  try {
    let url = "/users/";
    if (role) {
      url += `?role=${encodeURIComponent(role)}`;
    }

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data; // array of users
  } catch (err) {
    console.error("Error fetching users:", err);
    throw new Error(
      err.response?.data?.message || "Failed to fetch users"
    );
  }
};

/**
 * Fetch single user by ID
 */
export const fetchUser = async (id, token) => {
  try {
    const res = await axios.get(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching user:", err);
    throw new Error(
      err.response?.data?.message || "Failed to fetch user"
    );
  }
};

/**
 * Create a new user
 */
export const createUser = async (data, token) => {
  try {
    const res = await axios.post("/users/", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error creating user:", err);
    throw new Error(
      err.response?.data?.message || "Failed to create user"
    );
  }
};

/**
 * Update a user by ID
 */
export const updateUser = async (id, data, token) => {
  try {
    const res = await axios.put(`/users/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error updating user:", err);
    throw new Error(
      err.response?.data?.message || "Failed to update user"
    );
  }
};

/**
 * Delete a user by ID
 */
export const deleteUser = async (id, token) => {
  try {
    const res = await axios.delete(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error deleting user:", err);
    throw new Error(
      err.response?.data?.message || "Failed to delete user"
    );
  }
};
