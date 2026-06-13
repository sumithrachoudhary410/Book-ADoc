import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUsers, FaUserMd, FaCalendarCheck, FaClock, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { getAdminStats, getAllDoctors, updateDoctorStatus } from '../../api/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetch = async () => {
    try {
      const [statsRes, docsRes] = await Promise.all([getAdminStats(), getAllDoctors()]);
      setStats(statsRes.data.data);
      setPendingDocs(docsRes.data.data.filter((d) => d.status === 'pending').slice(0, 5));
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleApprove = async (id, status) => {
    setUpdating(id + status);
    try {
      await updateDoctorStatus(id, status);
      toast.success(`Doctor ${status}`);
      fetch();
    } catch { toast.error('Action failed'); }
    finally { setUpdating(null); }
  };

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <div className="container-custom">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform overview and management</p>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid-3" style={{ marginBottom: '2rem' }}>
              {[
                { label: 'Total Patients', val: stats?.totalUsers || 0, icon: <FaUsers />, color: 'blue' },
                { label: 'Approved Doctors', val: stats?.totalDoctors || 0, icon: <FaUserMd />, color: 'teal' },
                { label: 'Pending Approvals', val: stats?.pendingDoctors || 0, icon: <FaClock />, color: 'orange' },
                { label: 'Total Appointments', val: stats?.totalAppointments || 0, icon: <FaCalendarCheck />, color: 'purple' },
                { label: 'Pending Appointments', val: stats?.pendingAppointments || 0, icon: <FaClock />, color: 'red' },
                { label: 'Confirmed Appointments', val: stats?.approvedAppointments || 0, icon: <FaCheckCircle />, color: 'green' },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                  <div>
                    <div className="stat-value">{s.val}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pending Doctor Approvals */}
            <div className="card-custom">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', margin: 0 }}>
                  Pending Doctor Approvals
                </h2>
                <Link to="/admin/doctors" style={{ color: 'var(--accent)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  View All <FaArrowRight style={{ fontSize: '0.7rem' }} />
                </Link>
              </div>

              {pendingDocs.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <div className="empty-state-icon">✅</div>
                  <h3>All caught up!</h3>
                  <p>No pending doctor applications</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table-custom">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Specialization</th>
                        <th>Experience</th>
                        <th>Fee</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingDocs.map((doc) => (
                        <tr key={doc._id}>
                          <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Dr. {doc.firstName} {doc.lastName}</td>
                          <td>{doc.specialization}</td>
                          <td>{doc.experience} yrs</td>
                          <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{doc.feesPerConsultation}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleApprove(doc._id, 'approved')}
                                disabled={!!updating}
                                className="btn-success-custom"
                                style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                              >
                                {updating === doc._id + 'approved' ? '...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleApprove(doc._id, 'rejected')}
                                disabled={!!updating}
                                className="btn-danger-custom"
                                style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                              >
                                {updating === doc._id + 'rejected' ? '...' : 'Reject'}
                              </button>
                            </div>
                          </td>
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

export default AdminDashboard;
