import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import WaiterDashboard from './pages/WaiterDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import BarDashboard from './pages/BarDashboard';
import ButcheryDashboard from './pages/ButcheryDashboard';
import CashierDashboard from './pages/CashierDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/manager" element={<ProtectedRoute roles={['manager']}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/waiter" element={<ProtectedRoute roles={['waiter']}><WaiterDashboard /></ProtectedRoute>} />
          <Route path="/cashier" element={<ProtectedRoute roles={['cashier']}><CashierDashboard /></ProtectedRoute>} />
          <Route path="/kitchen" element={<ProtectedRoute roles={['kitchen']}><KitchenDashboard /></ProtectedRoute>} />
          <Route path="/bar" element={<ProtectedRoute roles={['bar']}><BarDashboard /></ProtectedRoute>} />
          <Route path="/butchery" element={<ProtectedRoute roles={['butchery']}><ButcheryDashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
