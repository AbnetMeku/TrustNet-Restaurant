import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function CashierDashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{user.role} Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <p>Welcome, {user.name}</p>
    </div>
  );
}
