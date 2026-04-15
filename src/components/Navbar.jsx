// ============================================================
// components/Navbar.jsx - Top navigation bar
// Shows different links depending on login status and role
// ============================================================

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  // Helper: add 'active' class to the current page link
  const isActive = (path) => location.pathname === path ? 'active' : '';

  // Log out and redirect to login page
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Brand / logo area */}
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-name">StudyGroup<span className="brand-accent">Finder</span></span>
        </Link>

        {/* Navigation links */}
        <div className="navbar-links">
          <Link to="/groups" className={`nav-link ${isActive('/groups')}`}>
            Browse Groups
          </Link>

          {/* Links only shown when logged in */}
          {user && (
            <>
              <Link to="/" className={`nav-link ${isActive('/')}`}>
                Dashboard
              </Link>
              <Link to="/groups/create" className="nav-link btn-create">
                + Create Group
              </Link>
            </>
          )}

          {/* Admin link - only for admins */}
          {user?.role === 'admin' && (
            <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>
              Admin
            </Link>
          )}
        </div>

        {/* Auth buttons */}
        <div className="navbar-auth">
          {user ? (
            <div className="user-menu">
              <span className="user-greeting">
                👋 {user.name.split(' ')[0]}
              </span>
              <button onClick={handleLogout} className="btn btn-outline-sm">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login"    className="btn btn-outline-sm">Login</Link>
              <Link to="/register" className="btn btn-primary-sm">Sign Up</Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
