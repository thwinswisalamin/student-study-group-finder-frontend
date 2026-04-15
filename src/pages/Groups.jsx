// ============================================================
// pages/Groups.jsx - Public study group repository/directory
// Supports live search by group title, course name, or code
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getGroups } from '../api.js';
import { useAuth } from '../App.jsx';

export default function Groups() {
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [groups,   setGroups]   = useState([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // Fetch groups whenever the search term changes.
  // We debounce it with a small timeout to avoid firing on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGroups();
    }, 300); // wait 300ms after the user stops typing

    return () => clearTimeout(timer); // cancel previous timer on each keystroke
  }, [search]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const data   = await getGroups(params);
      setGroups(data);
    } catch (err) {
      setError('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">

      {/* Page title and create button */}
      <div className="page-header">
        <div>
          <h1>Study Groups</h1>
          <p className="subtitle">Find a group that matches your course and join them</p>
        </div>
        {user && (
          <Link to="/groups/create" className="btn btn-primary">
            + Create Group
          </Link>
        )}
      </div>

      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍  Search by group name, course name, or course code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Error state */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Loading state */}
      {loading ? (
        <div className="loading">Loading groups...</div>
      ) : groups.length === 0 ? (
        // Empty state - shown when no groups match the search
        <div className="empty-state centered">
          <span className="empty-icon">📭</span>
          <p>No study groups found{search ? ` for "${search}"` : ''}.</p>
          {user && (
            <Link to="/groups/create" className="btn btn-primary">
              Be the first — create a group!
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Result count */}
          <p className="result-count">
            {groups.length} group{groups.length !== 1 ? 's' : ''} found
          </p>

          {/* Groups grid */}
          <div className="groups-grid">
            {groups.map(group => (
              <div
                key={group.id}
                className="group-card-full"
                onClick={() => user ? navigate(`/groups/${group.id}`) : navigate('/login')}
              >
                {/* Course badge + member count */}
                <div className="group-card-top">
                  <span className="group-badge">{group.course_code || 'GRP'}</span>
                  <span className="member-count">👥 {group.member_count} member{group.member_count !== 1 ? 's' : ''}</span>
                </div>

                <h2 className="group-card-title">{group.name}</h2>
                <p className="group-course">{group.course_name}</p>

                {/* Description - truncated to 2 lines via CSS */}
                {group.description && (
                  <p className="group-description">{group.description}</p>
                )}

                {/* Footer: leader name + meeting location */}
                <div className="group-card-footer">
                  <span>👤 {group.leader_name}</span>
                  {group.meeting_location && (
                    <span>📍 {group.meeting_location}</span>
                  )}
                </div>

                <button className="btn btn-outline btn-sm">
                  {user ? 'View Group' : 'Login to Join'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
