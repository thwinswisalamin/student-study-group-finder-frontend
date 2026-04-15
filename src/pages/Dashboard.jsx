// ============================================================
// pages/Dashboard.jsx - Student's personal dashboard
// Shows: groups they belong to, upcoming sessions, recent groups
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyGroups, getUpcomingSessions, getGroups } from '../api.js';
import { useAuth } from '../App.jsx';

export default function Dashboard() {
  const { user } = useAuth();

  // State for the three dashboard sections
  const [myGroups,  setMyGroups]  = useState([]);
  const [sessions,  setSessions]  = useState([]);
  const [recent,    setRecent]    = useState([]);
  const [loading,   setLoading]   = useState(true);

  // Load all three data sets in parallel when the page mounts
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [groups, upcoming, allGroups] = await Promise.all([
          getMyGroups(),
          getUpcomingSessions(),
          getGroups()  // used for the "recently created" section
        ]);

        setMyGroups(groups);
        setSessions(upcoming);
        // Show the 4 most recent groups (excluding ones the user is already in)
        setRecent(allGroups.slice(0, 4));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) return <div className="loading">Loading your dashboard...</div>;

  return (
    <div className="dashboard">

      {/* Welcome header */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user.name.split(' ')[0]} 👋</h1>
          <p className="subtitle">
            {user.program || 'UCU Student'} {user.year_of_study ? `· Year ${user.year_of_study}` : ''}
          </p>
        </div>
        <Link to="/groups/create" className="btn btn-primary">
          + Create Study Group
        </Link>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-number">{myGroups.length}</span>
          <span className="stat-label">My Groups</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{sessions.length}</span>
          <span className="stat-label">Upcoming Sessions</span>
        </div>
      </div>

      <div className="dashboard-grid">

        {/* ---- My Study Groups ---- */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>My Study Groups</h2>
            <Link to="/groups" className="see-all">See all groups →</Link>
          </div>

          {myGroups.length === 0 ? (
            <div className="empty-state">
              <p>You haven't joined any groups yet.</p>
              <Link to="/groups" className="btn btn-outline">Browse Groups</Link>
            </div>
          ) : (
            <div className="group-list">
              {myGroups.map(group => (
                <Link to={`/groups/${group.id}`} key={group.id} className="group-card">
                  <div className="group-card-top">
                    <span className="group-badge">{group.course_code || group.course_name?.slice(0, 6)}</span>
                    <span className="member-count">👥 {group.member_count}</span>
                  </div>
                  <h3 className="group-card-title">{group.name}</h3>
                  <p className="group-card-meta">{group.course_name}</p>
                  {group.leader_id === user.id && (
                    <span className="leader-badge">Leader</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ---- Upcoming Sessions ---- */}
        <section className="dashboard-section">
          <h2>Upcoming Study Sessions</h2>

          {sessions.length === 0 ? (
            <div className="empty-state">
              <p>No upcoming sessions scheduled.</p>
            </div>
          ) : (
            <div className="session-list">
              {sessions.map(session => (
                <div key={session.id} className="session-card">
                  <div className="session-date">
                    <span className="date-day">
                      {new Date(session.date).toLocaleDateString('en-UG', { day: 'numeric' })}
                    </span>
                    <span className="date-month">
                      {new Date(session.date).toLocaleDateString('en-UG', { month: 'short' })}
                    </span>
                  </div>
                  <div className="session-info">
                    <p className="session-title">{session.title}</p>
                    <p className="session-group">{session.group_name}</p>
                    <p className="session-time">
                      🕐 {session.time} {session.location ? `· 📍 ${session.location}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ---- Recently Created Groups ---- */}
        <section className="dashboard-section full-width">
          <div className="section-header">
            <h2>Recently Created Groups</h2>
            <Link to="/groups" className="see-all">Browse all →</Link>
          </div>

          <div className="group-list">
            {recent.map(group => (
              <Link to={`/groups/${group.id}`} key={group.id} className="group-card">
                <div className="group-card-top">
                  <span className="group-badge">{group.course_code || 'GRP'}</span>
                  <span className="member-count">👥 {group.member_count}</span>
                </div>
                <h3 className="group-card-title">{group.name}</h3>
                <p className="group-card-meta">{group.course_name}</p>
                <p className="group-card-leader">Leader: {group.leader_name}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
