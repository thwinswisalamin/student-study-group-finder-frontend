// ============================================================
// pages/Register.jsx - New student registration form
// Collects name, email, password, program, and year of study
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../api.js';

// UCU BBUC programs offered - used to populate the dropdown
const PROGRAMS = [
  'Bachelor of Science in Information Technology',
  'Bachelor of Computer Science',
  'Bachelor of Business Administration',
  'Bachelor of Arts in Education',
  'Bachelor of Science in Nursing',
  'Bachelor of Laws',
  'Other'
];

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:          '',
    email:         '',
    password:      '',
    program:       '',
    year_of_study: ''
  });

  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Basic client-side password length check before hitting the server
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      await apiRegister(form);
      setSuccess('Account created! Redirecting to login...');
      // Give the user a moment to read the success message, then redirect
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join the UCU Study Group Finder</p>
        </div>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="e.g. Muhereza Daniel"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="e.g. daniel@students.ucu.ac.ug"
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
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Program of study dropdown */}
          <div className="form-group">
            <label htmlFor="program">Program of Study</label>
            <select
              id="program"
              name="program"
              value={form.program}
              onChange={handleChange}
            >
              <option value="">-- Select your program --</option>
              {PROGRAMS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Year of study */}
          <div className="form-group">
            <label htmlFor="year_of_study">Year of Study</label>
            <select
              id="year_of_study"
              name="year_of_study"
              value={form.year_of_study}
              onChange={handleChange}
            >
              <option value="">-- Select year --</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>

      </div>
    </div>
  );
}
