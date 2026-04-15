// ============================================================
// pages/AdminPanel.jsx - Administrator dashboard
// Shows: total users, total groups, top courses, recent groups,
//        and a full user list table
// ============================================================

import React, { useState, useEffect } from 'react';
import { getAdminStats, getAdminUsers } from '../api.js';

export default function AdminPanel() {
  const [stats,   setStats]   = useState(null);
  const [users,   setUsers]   = useState([]);
  const [tab,     setTab]     = useState('overview'); // 'overview' | 'users'
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, usersData] = await Promise.all([
          getAdminStats(),
          getAdminUsers()
        ]);
        setStats(statsData);
        setUsers(usersData);
      } catch (err) {
        setError('Failed to load admin data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading admin dashboard...</div>;
  if (error)   return <div className="alert alert-error">{error}</div>;

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <h1>🛡️ Admin Dashboard</h1>
          <p className="subtitle">Platform overview for Study Group Finder</p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="tab-nav">
        <button
          className={`tab-btn ${tab === 'overview' ? 'active' : ''}`}
          onClick={() => setTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${tab === 'users' ? 'active' : ''}`}
          onClick={() => setTab('users')}
        >
          All Users ({users.length})
        </button>
      </div>

      {/* ---- OVERVIEW TAB ---- */}
      {tab === 'overview' && (
        <div className="tab-content">

          {/* KPI stat cards */}
          <div className="admin-stats">
            <div className="admin-stat-card">
              <span className="stat-number">{stats.total_users}</span>
              <span className="stat-label">Registered Students</span>
            </div>
            <div className="admin-stat-card">
              <span className="stat-number">{stats.total_groups}</span>
              <span className="stat-label">Study Groups</span>
            </div>
          </div>

          {/* Two columns: top courses + recent groups */}
          <div className="admin-grid">

            {/* Most active courses */}
            <div className="admin-section">
              <h3>🏆 Most Active Courses</h3>
              {stats.top_courses.length === 0 ? (
                <p className="muted">No groups created yet.</p>
              ) : (
                <table className="simple-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Course</th>
                      <th>Groups</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.top_courses.map((c, i) => (
                      <tr key={c.course_name}>
                        <td>{i + 1}</td>
                        <td>{c.course_name}</td>
                        <td><strong>{c.group_count}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Recently created groups */}
            <div className="admin-section">
              <h3>🕐 Recently Created Groups</h3>
              {stats.recent_groups.length === 0 ? (
                <p className="muted">No groups yet.</p>
              ) : (
                <table className="simple-table">
                  <thead>
                    <tr>
                      <th>Group</th>
                      <th>Course</th>
                      <th>Leader</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_groups.map(g => (
                      <tr key={g.id}>
                        <td>{g.name}</td>
                        <td>{g.course_code || g.course_name}</td>
                        <td>{g.leader_name}</td>
                        <td>{new Date(g.created_at).toLocaleDateString('en-UG')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---- USERS TAB ---- */}
      {tab === 'users' && (
        <div className="tab-content">
          <h3>All Registered Users</h3>
          <div className="table-wrapper">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Program</th>
                  <th>Year</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.program || '—'}</td>
                    <td>{u.year_of_study ? `Year ${u.year_of_study}` : '—'}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>{u.role}</span>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString('en-UG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
