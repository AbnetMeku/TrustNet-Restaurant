import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/auth/login', {
        username,
        password,
      });

      const { user, access_token } = res.data;
      login(user, access_token);

      switch (user.role) {
        case 'admin': navigate('/admin'); break;
        case 'manager': navigate('/manager'); break;
        case 'waiter': navigate('/waiter'); break;
        case 'cashier': navigate('/cashier'); break;
        case 'kitchen': navigate('/kitchen'); break;
        case 'bar': navigate('/bar'); break;
        case 'butchery': navigate('/butchery'); break;
        default: navigate('/login'); break;
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/Background.jpeg')" }}
      ></div>

      {/* Black overlay */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      {/* Login card */}
<form
  onSubmit={handleSubmit}
  className="relative z-10 bg-white/20 backdrop-blur-md shadow-2xl rounded-xl p-10 w-full max-w-sm transform transition-transform duration-500 ease-out scale-95 animate-fade-in"
>
  {/* Logo */}
  <img src="/logo.png" alt="TrustNet Logo" className="w-24 mx-auto mb-6" />

  <h2 className="text-3xl font-bold mb-8 text-center text-white">Sign In</h2>

  {error && <p className="text-red-500 text-center mb-4">{error}</p>}

  <div className="mb-4">
    <label className="block text-white font-medium mb-2">Username</label>
    <input
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="w-full px-4 py-2 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
      placeholder="መለያ ቁጥር ወይም ስም"
      required
    />
  </div>

  <div className="mb-6">
    <label className="block text-white font-medium mb-2">Password</label>
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full px-4 py-2 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
      placeholder="ሚስጥር ቁጥር"
      required
    />
  </div>

  <button
    type="submit"
    className="w-full bg-blue-600/80 hover:bg-blue-700/80 text-white font-semibold py-2 rounded-lg transition-colors"
  >
    Login | ግባ
  </button>
</form>

    </div>
  );
}
