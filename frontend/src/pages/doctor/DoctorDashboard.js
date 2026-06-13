import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCalendarCheck, FaClock, FaUserFriends, FaCheckCircle, FaTimesCircle, FaArrowRight } from 'react-icons/fa';
import { getDoctorAppointments, getDoctorProfile } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const apptRes = await getDoctorAppointments();
        setAppointments(apptRes.data.data);
      } catch (err) {
        toast.error('Failed to load appointments');
      }

      try {
        const profRes = await getDoctorProfile();
        setProfile(profRes.data.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setProfile(null);
        } else {
          toast.error('Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    approved: appointments.filter((a) => a.status === 'approved').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
  };

  const recent = appointments.slice(0, 5);
  const STATUS_COLORS = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', completed: 'badge-completed' };

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <div className="container-custom">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Doctor Dashboard</h1>
          <p className="page-subtitle">Welcome back, Dr. {profile?.firstName || user?.name}</p>
        </div>

        {/* Profile Status */}
        {!profile && !loading && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FaTimesCircle style={{ color: 'var(--danger)', fontSize: '1.2rem' }} />
              <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '0.95rem' }}>
                Your professional profile is not set up yet!
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Patients cannot find you or book appointments with you until you complete your profile details and submit them for admin approval.
            </p>
            <div>
              <Link id="setup-profile-link" to="/doctor/profile" className="btn-primary-custom" style={{ display: 'inline-flex', padding: '0.4rem 1.2rem', fontSize: '0.85rem', textDecoration: 'none' }}>
                Set Up Profile Now
              </Link>
            </div>
          </div>
        )}

        {profile && profile.status !== 'approved' && (
          <div style={{
            background: profile.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${profile.status === 'pending' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            {profile.status === 'pending' ? (
              <><FaClock style={{ color: 'var(--warning)' }} />
              <span style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '0.875rem' }}>Your profile is pending admin approval. You'll receive notifications once approved.</span></>
            ) : (
              <><FaTimesCircle style={{ color: 'var(--danger)' }} />
              <span style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.875rem' }}>Your application was rejected. Please contact support for details.</span></>
            )}
          </div>
        )}

        {/* Stats Grid */}
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <>
            <div className="grid-4" style={{ marginBottom: '2rem' }}>
              <div className="stat-card">
                <div className="stat-icon blue"><FaCalendarCheck /></div>
                <div><div className="stat-value">{stats.total}</div><div className="stat-label">Total Appointments</div></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange"><FaClock /></div>
                <div><div className="stat-value">{stats.pending}</div><div className="stat-label">Pending</div></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green"><FaCheckCircle /></div>
                <div><div className="stat-value">{stats.approved}</div><div className="stat-label">Approved</div></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon teal"><FaUserFriends /></div>
                <div><div className="stat-value">{stats.completed}</div><div className="stat-label">Completed</div></div>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="card-custom">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', margin: 0 }}>Recent Appointments</h2>
                <Link to="/doctor/appointments" style={{ color: 'var(--accent)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  View All <FaArrowRight style={{ fontSize: '0.7rem' }} />
                </Link>
              </div>

              {recent.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <div className="empty-state-icon">📋</div>
                  <h3>No appointments yet</h3>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table-custom">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((a) => (
                        <tr key={a._id}>
                          <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{a.patientName}</td>
                          <td>{a.date}</td>
                          <td>{a.time}</td>
                          <td><span className={`badge-custom ${STATUS_COLORS[a.status]}`}>{a.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
