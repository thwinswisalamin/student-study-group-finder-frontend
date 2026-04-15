// ============================================================
// pages/Login.jsx - Student login form
// On success, saves the token and user then redirects to dashboard
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api.js';
import { useAuth } from '../App.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  // Form field state
  const [form, setForm]       = useState({ email: '', password: '' });
  // Error message shown below the form
  const [error, setError]     = useState('');
  // Disable the button while the request is in flight
  const [loading, setLoading] = useState(false);

  // Generic change handler - updates whichever field changed
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send credentials to the backend
      const data = await apiLogin(form);

      // Save user session and redirect to dashboard
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Header */}
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Log in to access your study groups</p>
        </div>

        {/* Error banner */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="auth-form">

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="e.g. mugisha@students.ucu.ac.ug"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Link to registration */}
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign up here</Link>
        </p>

      </div>
    </div>
  );
}
