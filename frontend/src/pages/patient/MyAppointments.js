import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaClock, FaUpload, FaFileAlt, FaUserMd } from 'react-icons/fa';
import { getPatientAppointments, uploadDocument } from '../../api/api';

const STATUS_COLORS = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', completed: 'badge-completed' };
const STATUS_DOT = { pending: 'var(--warning)', approved: 'var(--success)', rejected: 'var(--danger)', completed: 'var(--accent)' };

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [uploadingId, setUploadingId] = useState(null);
  const fileRef = useRef();

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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
