import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaClock, FaUser, FaFileAlt } from 'react-icons/fa';
import { getDoctorAppointments, updateAppointmentStatus } from '../../api/api';

const STATUS_COLORS = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', completed: 'badge-completed' };

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  const fetch = async () => {
    try {
      const { data } = await getDoctorAppointments();
      setAppointments(data.data);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleStatus = async (id, status) => {
    setUpdating(id + status);
    try {
      await updateAppointmentStatus(id, status);
      toast.success(`Appointment ${status}`);
      fetch();
    } catch { toast.error('Failed to update'); }
    finally { setUpdating(null); }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <div className="container-custom">
        <div className="page-header">
          <h1 className="page-title">My Appointments</h1>
          <p className="page-subtitle">Manage patient appointment requests</p>
        </div>

        <div className="filter-bar">
          {['all', 'pending', 'approved', 'rejected', 'completed'].map((f) => (
            <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No {filter !== 'all' ? filter : ''} appointments</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((appt) => (
              <div key={appt._id} className="card-custom" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Patient Icon */}
                  <div className="stat-icon blue" style={{ width: 44, height: 44, flexShrink: 0 }}>
                    <FaUser />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{appt.patientName}</div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        📅 {appt.date}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <FaClock style={{ fontSize: '0.7rem' }} /> {appt.time}
                      </span>
                      {appt.documents?.length > 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <FaFileAlt style={{ fontSize: '0.7rem' }} /> {appt.documents.length} document(s)
                        </span>
                      )}
                    </div>
                    {appt.notes && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem', marginBottom: 0, lineHeight: 1.5 }}>
                        💬 {appt.notes}
                      </p>
                    )}
                  </div>

                  {/* Status + Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem', flexShrink: 0 }}>
                    <span className={`badge-custom ${STATUS_COLORS[appt.status]}`}>{appt.status}</span>

                    {appt.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleStatus(appt._id, 'approved')}
                          disabled={!!updating}
                          className="btn-success-custom"
                          style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <FaCheck /> {updating === appt._id + 'approved' ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleStatus(appt._id, 'rejected')}
                          disabled={!!updating}
                          className="btn-danger-custom"
                          style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <FaTimes /> {updating === appt._id + 'rejected' ? '...' : 'Reject'}
                        </button>
                      </div>
                    )}

                    {appt.status === 'approved' && (
                      <button
                        onClick={() => handleStatus(appt._id, 'completed')}
                        disabled={!!updating}
                        className="btn-primary-custom"
                        style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem' }}
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
