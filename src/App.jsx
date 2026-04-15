// ============================================================
// src/App.jsx - Root component: routing + authentication context
//
// We store the logged-in user in React state and expose it
// via a simple Context so any page can read it without prop drilling.
// React Router v6 handles all client-side navigation.
// ============================================================

import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Page components
import Login        from './pages/Login.jsx';
import Register     from './pages/Register.jsx';
import Dashboard    from './pages/Dashboard.jsx';
import Groups       from './pages/Groups.jsx';
import GroupDetail  from './pages/GroupDetail.jsx';
import CreateGroup  from './pages/CreateGroup.jsx';
import AdminPanel   from './pages/AdminPanel.jsx';
import Navbar       from './components/Navbar.jsx';

// ============================================================
// Auth Context - makes user info available everywhere
// ============================================================
export const AuthContext = createContext(null);

// Custom hook for convenient access: const { user } = useAuth();
export const useAuth = () => useContext(AuthContext);

// ============================================================
// ProtectedRoute - redirects to /login if user is not logged in
// ============================================================
function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}

// ============================================================
// App - sets up auth state, context, and routes
// ============================================================
export default function App() {
  // user = null means logged out; user = {...} means logged in
  const [user, setUser] = useState(null);

  // On first load, check localStorage for a saved user session
  // This keeps the user logged in after a page refresh
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Called after successful login - saves user to state and localStorage
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Called on logout - clears everything
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    // Provide user, login, and logout to all child components
    <AuthContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        {/* Navbar is shown on all pages */}
        <Navbar />

        <main className="main-content">
          <Routes>
            {/* Public routes - accessible without login */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/groups"   element={<Groups />} />

            {/* Protected routes - require login */}
            <Route path="/" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/groups/:id" element={
              <ProtectedRoute><GroupDetail /></ProtectedRoute>
            } />
            <Route path="/groups/create" element={
              <ProtectedRoute><CreateGroup /></ProtectedRoute>
            } />

            {/* Admin-only route */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}><AdminPanel /></ProtectedRoute>
            } />

            {/* Catch-all: redirect unknown URLs to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
