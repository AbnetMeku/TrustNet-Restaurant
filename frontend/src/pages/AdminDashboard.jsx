import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <p>Welcome, {user.name} ({user.role})</p>
      <div className="mt-8">
        {/* TODO: Add user management table & forms here */}
        <p>User management features will go here.</p>
      </div>
    </div>
  );
}
