// ============================================================
// pages/CreateGroup.jsx - Form to create a new study group
// On success, redirects to the newly created group's page
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup } from '../api.js';

export default function CreateGroup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:             '',
    course_name:      '',
    course_code:      '',
    description:      '',
    meeting_location: ''
  });

  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await createGroup(form);
      // Redirect to the newly created group's detail page
      navigate(`/groups/${data.groupId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container narrow">

      <div className="page-header">
        <h1>Create a Study Group</h1>
        <p className="subtitle">Fill in the details to start a new study group at UCU BBUC</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit}>

          {/* Group name - required */}
          <div className="form-group">
            <label htmlFor="name">Group Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="e.g. CSC1202 Web Dev Study Group"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Course name and code on the same row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="course_name">Course Name *</label>
              <input
                id="course_name"
                type="text"
                name="course_name"
                placeholder="e.g. Web and Mobile Application Development"
                value={form.course_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="course_code">Course Code</label>
              <input
                id="course_code"
                type="text"
                name="course_code"
                placeholder="e.g. CSC1202"
                value={form.course_code}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Study focus description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              placeholder="Describe what this group focuses on — topics, exam revision, assignments, etc."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* Where the group meets */}
          <div className="form-group">
            <label htmlFor="meeting_location">Meeting Location</label>
            <input
              id="meeting_location"
              type="text"
              name="meeting_location"
              placeholder="e.g. BBUC Library Room 3 / Online (Zoom)"
              value={form.meeting_location}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(-1)} // go back to previous page
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
