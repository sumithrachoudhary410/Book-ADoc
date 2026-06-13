import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaClock, FaUpload, FaFileAlt, FaUserMd, FaStar } from 'react-icons/fa';
import { getPatientAppointments, uploadDocument, submitFeedback } from '../../api/api';

const STATUS_COLORS = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', completed: 'badge-completed' };
const STATUS_DOT = { pending: 'var(--warning)', approved: 'var(--success)', rejected: 'var(--danger)', completed: 'var(--accent)' };

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [uploadingId, setUploadingId] = useState(null);
  const fileRef = useRef();

  // Rating Modal States
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [ratingId, setRatingId] = useState(null);
  const [submittingRating, setSubmittingRating] = useState(false);

  const openRatingModal = (apptId) => {
    setRatingId(apptId);
    setRating(5);
    setFeedback('');
    setShowModal(true);
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRating(true);
    try {
      await submitFeedback(ratingId, { rating, feedback });
      toast.success('Thank you for your feedback!');
      setShowModal(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const fetch = async () => {
    try {
      const { data } = await getPatientAppointments();
      setAppointments(data.data);
    } catch (err) { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleUpload = async (appointmentId, file) => {
    const formData = new FormData();
    formData.append('document', file);
    setUploadingId(appointmentId);
    try {
      await uploadDocument(appointmentId, formData);
      toast.success('Document uploaded!');
      fetch();
    } catch { toast.error('Upload failed'); }
    finally { setUploadingId(null); }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return { day: d.getDate(), month: d.toLocaleString('default', { month: 'short' }) };
  };

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <div className="container-custom" style={{ maxWidth: '860px' }}>
        <div className="page-header">
          <h1 className="page-title">My Appointments</h1>
          <p className="page-subtitle">Track and manage your medical appointments</p>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          {['all', 'pending', 'approved', 'rejected', 'completed'].map((f) => (
            <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} id={`filter-${f}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' && <span style={{ marginLeft: '0.3rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>({appointments.length})</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No {filter !== 'all' ? filter : ''} appointments</h3>
            <p>Your appointments will appear here after booking</p>
          </div>
        ) : (
          <div>
            {filtered.map((appt) => {
              const dt = formatDate(appt.date);
              return (
                <div key={appt._id} className="appointment-card">
                  {/* Date Box */}
                  <div className="appt-date-box">
                    <div className="appt-date-day">{dt.day || appt.date}</div>
                    <div className="appt-date-mon">{dt.month || ''}</div>
                  </div>

                  {/* Info */}
                  <div className="appt-info">
                    <div className="appt-doctor">
                      <FaUserMd style={{ color: 'var(--accent)', marginRight: '0.35rem', fontSize: '0.85rem' }} />
                      {appt.doctorName}
                    </div>
                    <div className="appt-spec">{appt.doctorInfo?.specialization}</div>
                    <div className="appt-time">
                      <FaClock style={{ fontSize: '0.7rem', marginRight: '0.25rem' }} />
                      {appt.time}
                    </div>
                    {appt.notes && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', marginBottom: 0 }}>
                        📋 {appt.notes.substring(0, 80)}{appt.notes.length > 80 ? '...' : ''}
                      </p>
                    )}
                  </div>

                  {/* Right Side */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                    <span className={`badge-custom ${STATUS_COLORS[appt.status]}`}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_DOT[appt.status], display: 'inline-block' }}></span>
                      {appt.status}
                    </span>

                    {/* Fee */}
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700 }}>
                      ₹{appt.doctorInfo?.fee || 'N/A'}
                    </span>

                    {/* Upload Document */}
                    {appt.status === 'approved' && (
                      <>
                        <input type="file" ref={fileRef} style={{ display: 'none' }}
                          onChange={(e) => { if (e.target.files[0]) handleUpload(appt._id, e.target.files[0]); e.target.value = ''; }}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <button
                          onClick={() => { setUploadingId(appt._id); fileRef.current.click(); }}
                          disabled={uploadingId === appt._id}
                          style={{ background: 'var(--accent-glow)', border: '1px solid rgba(56,189,248,0.3)', color: 'var(--accent)', fontSize: '0.72rem', fontWeight: 600, padding: '0.3rem 0.7rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'inherit' }}
                        >
                          <FaUpload style={{ fontSize: '0.65rem' }} />
                          {uploadingId === appt._id ? 'Uploading...' : 'Upload Doc'}
                        </button>
                      </>
                    )}

                    {/* Document count */}
                    {appt.documents?.length > 0 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <FaFileAlt style={{ color: 'var(--accent)' }} /> {appt.documents.length} doc{appt.documents.length > 1 ? 's' : ''}
                      </span>
                    )}

                    {/* Rate Doctor / Rating Display */}
                    {appt.status === 'completed' && !appt.isReviewed && (
                      <button
                        onClick={() => openRatingModal(appt._id)}
                        className="btn-primary-custom"
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', fontWeight: 600, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer' }}
                      >
                        Rate Doctor
                      </button>
                    )}
                    {appt.status === 'completed' && appt.isReviewed && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <FaStar style={{ fontSize: '0.8rem' }} /> {appt.rating}/5
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Rating Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(11,17,32,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="card-custom" style={{ maxWidth: '450px', width: '90%', padding: '1.5rem', border: '1px solid var(--border-light)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Rate Your Doctor</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>Your feedback helps others choose the right doctor.</p>
            
            <form onSubmit={handleRatingSubmit}>
              {/* Stars selector */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '2rem',
                      color: star <= rating ? 'var(--warning)' : 'var(--text-muted)',
                      padding: 0,
                      transition: 'color 0.2s'
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>

              {/* Feedback Comment */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label-custom">Comments / Review</label>
                <textarea
                  className="form-control-custom"
                  rows={3}
                  placeholder="Tell us about your experience..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline-custom"
                  style={{ padding: '0.4rem 1.2rem', fontSize: '0.82rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-custom"
                  style={{ padding: '0.4rem 1.2rem', fontSize: '0.82rem' }}
                  disabled={submittingRating}
                >
                  {submittingRating ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
