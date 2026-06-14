import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { getAllDoctors, updateDoctorStatus } from '../../api/api';

const STATUS_COLORS = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetch = async () => {
    try {
      const { data } = await getAllDoctors();
      setDoctors(data.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleStatus = async (id, status) => {
    setUpdating(id + status);
    try {
      await updateDoctorStatus(id, status);
      toast.success(`Doctor ${status}`);
      fetch();
    } catch { toast.error('Action failed'); }
    finally { setUpdating(null); }
  };

  const filtered = doctors.filter((d) => {
    const matchFilter = filter === 'all' || d.status === filter;
    const matchSearch = search === '' ||
      `${d.firstName} ${d.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <div className="container-custom">
        <div className="page-header">
          <h1 className="page-title">Manage Doctors</h1>
          <p className="page-subtitle">Review and approve doctor applications</p>
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <FaSearch style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }} />
            <input id="admin-doc-search" type="text" className="form-control-custom" placeholder="Search doctors..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
          </div>
        </div>
        <div className="filter-bar">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">👨‍⚕️</div><h3>No doctors found</h3></div>
        ) : (
          <div className="card-custom" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    <th>Fee</th>
                    <th>Address</th>
                    <th>Certificate</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => {
                    const backendBaseUrl = process.env.REACT_APP_API_URL
                      ? process.env.REACT_APP_API_URL.replace('/api', '')
                      : 'http://localhost:5000';
                    const certUrl = doc.certificate ? `${backendBaseUrl}/${doc.certificate}` : null;

                    return (
                      <tr key={doc._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                            Dr. {doc.firstName} {doc.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.email}</div>
                        </td>
                        <td>{doc.specialization}</td>
                        <td>{doc.experience} yrs</td>
                        <td style={{ color: 'var(--success)', fontWeight: 700 }}>₹{doc.feesPerConsultation}</td>
                        <td style={{ maxWidth: '150px' }}>{doc.address}</td>
                        <td>
                          {certUrl ? (
                            <a
                              href={certUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: 'var(--accent)',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem'
                              }}
                            >
                              📄 View Certificate
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No File</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge-custom ${STATUS_COLORS[doc.status]}`}>{doc.status}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {doc.status !== 'approved' && (
                              <button
                                onClick={() => handleStatus(doc._id, 'approved')}
                                disabled={!!updating}
                                className="btn-success-custom"
                                style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <FaCheck style={{ fontSize: '0.65rem' }} /> {updating === doc._id + 'approved' ? '...' : 'Approve'}
                              </button>
                            )}
                            {doc.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatus(doc._id, 'rejected')}
                                disabled={!!updating}
                                className="btn-danger-custom"
                                style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <FaTimes style={{ fontSize: '0.65rem' }} /> {updating === doc._id + 'rejected' ? '...' : 'Reject'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDoctors;
