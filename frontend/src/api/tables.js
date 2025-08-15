import axios from "axios";

const BASE_URL = "http://localhost:5000/tables"; // Adjust if backend hosted elsewhere

// Fetch all tables
export const fetchTables = async (token) => {
  if (!token) throw new Error("Missing auth token");
  try {
    const res = await axios.get(`${BASE_URL}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Error fetching tables:", err.response || err);
    throw err.response?.data || { message: "Failed to fetch tables" };
  }
};

// Create a new table
export const createTable = async (tableData, token) => {
  if (!token) throw new Error("Missing auth token");
  try {
    const res = await axios.post(`${BASE_URL}/`, tableData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error creating table:", err.response || err);
    throw err.response?.data || { message: "Failed to create table" };
  }
};

// Delete table
export const deleteTable = async (id, token) => {
  if (!token) throw new Error("Missing auth token");
  try {
    const res = await axios.delete(`${BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error deleting table:", err.response || err);
    throw err.response?.data || { message: "Failed to delete table" };
  }
};
