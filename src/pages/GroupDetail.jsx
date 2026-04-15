// ============================================================
// pages/GroupDetail.jsx - Full view of a single study group
// Tabs: Overview | Sessions | Discussion | Members
// Leaders see extra controls: Edit info, Schedule Session, Remove members
// ============================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getGroup, joinGroup, leaveGroup, removeMember,
  getGroupSessions, createSession,
  getGroupPosts, createPost,
  updateGroup
} from '../api.js';
import { useAuth } from '../App.jsx';

export default function GroupDetail() {
  const { id }     = useParams(); // group ID from the URL
  const { user }   = useAuth();
  const navigate   = useNavigate();

  // Core group data
  const [group,   setGroup]   = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Tab navigation: overview | sessions | posts | members
  const [tab, setTab] = useState('overview');

  // Sessions and posts (loaded lazily when their tabs are opened)
  const [sessions,   setSessions]   = useState([]);
  const [posts,      setPosts]      = useState([]);
  const [newPost,    setNewPost]    = useState('');
  const [postLoading, setPostLoading] = useState(false);

  // Session scheduling form (visible to leader)
  const [sessionForm, setSessionForm] = useState({
    title: '', date: '', time: '', location: '', description: ''
  });
  const [sessionMsg, setSessionMsg] = useState('');

  // Edit group form
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editMsg,  setEditMsg]  = useState('');

  // General action feedback message
  const [actionMsg, setActionMsg] = useState('');

  // ---- Load group on mount ----
  useEffect(() => { loadGroup(); }, [id]);

  const loadGroup = async () => {
    setLoading(true);
    try {
      const data = await getGroup(id);
      setGroup(data.group);
      setMembers(data.members);
      setEditForm(data.group); // pre-fill edit form with current values
    } catch (err) {
      setError('Group not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  // ---- Load sessions when "Sessions" tab is opened ----
  useEffect(() => {
    if (tab === 'sessions') {
      getGroupSessions(id).then(setSessions).catch(console.error);
    }
    if (tab === 'posts') {
      getGroupPosts(id).then(setPosts).catch(console.error);
    }
  }, [tab]);

  // Convenience flags
  const isMember = members.some(m => m.id === user?.id);
  const isLeader = group?.leader_id === user?.id;

  // ---- Join group ----
  const handleJoin = async () => {
    try {
      await joinGroup(id);
      setActionMsg('You joined the group! 🎉');
      loadGroup(); // refresh member list
    } catch (err) {
      setActionMsg(err.message);
    }
  };

  // ---- Leave group ----
  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    try {
      await leaveGroup(id);
      setActionMsg('You left the group.');
      loadGroup();
    } catch (err) {
      setActionMsg(err.message);
    }
  };

  // ---- Remove a member (leader action) ----
  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from the group?`)) return;
    try {
      await removeMember(id, memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      alert(err.message);
    }
  };

  // ---- Schedule a session ----
  const handleScheduleSession = async (e) => {
    e.preventDefault();
    setSessionMsg('');
    try {
      await createSession({ group_id: id, ...sessionForm });
      setSessionMsg('✅ Session scheduled!');
      setSessionForm({ title: '', date: '', time: '', location: '', description: '' });
      getGroupSessions(id).then(setSessions); // refresh sessions list
    } catch (err) {
      setSessionMsg('❌ ' + err.message);
    }
  };

  // ---- Post a message ----
  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPostLoading(true);
    try {
      await createPost({ group_id: id, content: newPost });
      setNewPost('');
      getGroupPosts(id).then(setPosts); // refresh posts
    } catch (err) {
      alert(err.message);
    } finally {
      setPostLoading(false);
    }
  };

  // ---- Edit group info ----
  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      await updateGroup(id, editForm);
      setEditMsg('✅ Group updated!');
      setEditMode(false);
      loadGroup();
    } catch (err) {
      setEditMsg('❌ ' + err.message);
    }
  };

  if (loading) return <div className="loading">Loading group...</div>;
  if (error)   return <div className="alert alert-error">{error}</div>;

  return (
    <div className="page-container">

      {/* ---- Group Header ---- */}
      <div className="group-detail-header">
        <div className="group-header-info">
          <span className="group-badge large">{group.course_code || 'GRP'}</span>
          <div>
            <h1>{group.name}</h1>
            <p className="group-course">{group.course_name}</p>
            <p className="group-meta">
              Leader: <strong>{group.leader_name}</strong> &nbsp;·&nbsp;
              {members.length} member{members.length !== 1 ? 's' : ''}
              {group.meeting_location && ` · 📍 ${group.meeting_location}`}
            </p>
          </div>
        </div>

        {/* Join / Leave button */}
        <div className="group-actions">
          {actionMsg && <p className="action-msg">{actionMsg}</p>}
          {!isLeader && (
            isMember
              ? <button onClick={handleLeave} className="btn btn-outline">Leave Group</button>
              : <button onClick={handleJoin}  className="btn btn-primary">Join Group</button>
          )}
          {isLeader && (
            <button onClick={() => setEditMode(!editMode)} className="btn btn-outline">
              {editMode ? 'Cancel Edit' : '✏️ Edit Group'}
            </button>
          )}
        </div>
      </div>

      {/* ---- Edit Group Form (leader only, collapsible) ---- */}
      {editMode && isLeader && (
        <div className="edit-form-box">
          <h3>Edit Group Information</h3>
          {editMsg && <p className="action-msg">{editMsg}</p>}
          <form onSubmit={handleEditSave} className="inline-form">
            <div className="form-row">
              <div className="form-group">
                <label>Group Name</label>
                <input value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Course Name</label>
                <input value={editForm.course_name || ''} onChange={e => setEditForm({...editForm, course_name: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Course Code</label>
                <input value={editForm.course_code || ''} onChange={e => setEditForm({...editForm, course_code: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Meeting Location</label>
                <input value={editForm.meeting_location || ''} onChange={e => setEditForm({...editForm, meeting_location: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows="3" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </div>
      )}

      {/* ---- Tab Navigation ---- */}
      <div className="tab-nav">
        {['overview', 'sessions', 'posts', 'members'].map(t => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* TAB: OVERVIEW                                                */}
      {/* ============================================================ */}
      {tab === 'overview' && (
        <div className="tab-content">
          <h3>About This Group</h3>
          <p>{group.description || 'No description provided.'}</p>
          <p className="muted">Created: {new Date(group.created_at).toLocaleDateString('en-UG')}</p>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: SESSIONS                                                */}
      {/* ============================================================ */}
      {tab === 'sessions' && (
        <div className="tab-content">

          {/* Schedule session form - leader only */}
          {isLeader && (
            <div className="session-form-box">
              <h3>Schedule a New Session</h3>
              {sessionMsg && <p className="action-msg">{sessionMsg}</p>}
              <form onSubmit={handleScheduleSession} className="inline-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Session Title</label>
                    <input
                      placeholder="e.g. Revision - Chapter 5"
                      value={sessionForm.title}
                      onChange={e => setSessionForm({...sessionForm, title: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={sessionForm.date}
                      onChange={e => setSessionForm({...sessionForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Time *</label>
                    <input
                      type="time"
                      value={sessionForm.time}
                      onChange={e => setSessionForm({...sessionForm, time: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location / Meeting Link</label>
                    <input
                      placeholder="e.g. Library Room 2 or https://meet.google.com/..."
                      value={sessionForm.location}
                      onChange={e => setSessionForm({...sessionForm, location: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      placeholder="Brief topic for this session"
                      value={sessionForm.description}
                      onChange={e => setSessionForm({...sessionForm, description: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">Schedule Session</button>
              </form>
            </div>
          )}

          {/* Sessions list */}
          <h3>All Sessions</h3>
          {sessions.length === 0 ? (
            <p className="muted">No sessions scheduled yet.</p>
          ) : (
            <div className="session-list">
              {sessions.map(s => (
                <div key={s.id} className="session-card">
                  <div className="session-date">
                    <span className="date-day">{new Date(s.date).toLocaleDateString('en-UG', { day: 'numeric' })}</span>
                    <span className="date-month">{new Date(s.date).toLocaleDateString('en-UG', { month: 'short' })}</span>
                  </div>
                  <div className="session-info">
                    <p className="session-title">{s.title}</p>
                    <p className="session-time">🕐 {s.time} {s.location ? `· 📍 ${s.location}` : ''}</p>
                    {s.description && <p className="muted">{s.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: POSTS / DISCUSSION                                      */}
      {/* ============================================================ */}
      {tab === 'posts' && (
        <div className="tab-content">

          {/* Post input - members only */}
          {isMember ? (
            <form onSubmit={handlePost} className="post-form">
              <textarea
                rows="3"
                placeholder="Share an announcement, question, or update with the group..."
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={postLoading}>
                {postLoading ? 'Posting...' : 'Post Message'}
              </button>
            </form>
          ) : (
            <p className="muted">Join this group to participate in discussions.</p>
          )}

          {/* Posts list */}
          <div className="posts-list">
            {posts.length === 0 ? (
              <p className="muted">No messages yet. Be the first to post!</p>
            ) : (
              posts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <span className="post-author">{post.author_name}</span>
                    <span className="post-time">
                      {new Date(post.created_at).toLocaleString('en-UG', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="post-content">{post.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: MEMBERS                                                 */}
      {/* ============================================================ */}
      {tab === 'members' && (
        <div className="tab-content">
          <h3>Members ({members.length})</h3>
          <div className="members-list">
            {members.map(member => (
              <div key={member.id} className="member-card">
                <div className="member-avatar">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="member-info">
                  <p className="member-name">
                    {member.name}
                    {member.id === group.leader_id && (
                      <span className="leader-badge">Leader</span>
                    )}
                  </p>
                  <p className="member-meta">
                    {member.program || 'UCU Student'}
                    {member.year_of_study ? ` · Year ${member.year_of_study}` : ''}
                  </p>
                </div>

                {/* Leader can remove any member except themselves */}
                {isLeader && member.id !== user.id && (
                  <button
                    onClick={() => handleRemoveMember(member.id, member.name)}
                    className="btn btn-danger-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
