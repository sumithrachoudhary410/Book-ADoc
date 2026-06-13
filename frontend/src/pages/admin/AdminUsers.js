import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTrash, FaSearch, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { getAllUsers, deleteUser, toggleUserStatus } from '../../api/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [acting, setActing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetch = async () => {
    try {
      const { data } = await getAllUsers();
      setUsers(data.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    setActing(id + 'del');
    try {
      await deleteUser(id);
      toast.success('User deleted');
      setConfirmDelete(null);
      fetch();
    } catch { toast.error('Delete failed'); }
    finally { setActing(null); }
  };

  const handleToggle = async (id) => {
    setActing(id + 'tog');
    try {
      await toggleUserStatus(id);
      toast.success('User status updated');
      fetch();
    } catch { toast.error('Action failed'); }
    finally { setActing(null); }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <div className="container-custom">
        <div className="page-header">
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">{users.length} registered users on the platform</p>
        </div>

        <div style={{ position: 'relative', maxWidth: '380px', marginBottom: '1.5rem' }}>
          <FaSearch style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }} />
          <input id="admin-user-search" type="text" className="form-control-custom" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">👥</div><h3>No users found</h3></div>
        ) : (
          <div className="card-custom" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td>
                        <span style={{
                          background: u.role === 'doctor' ? 'rgba(20,184,166,0.15)' : 'rgba(56,189,248,0.1)',
                          color: u.role === 'doctor' ? 'var(--teal)' : 'var(--accent)',
                          padding: '0.2rem 0.55rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.phone || '—'}</td>
                      <td style={{ fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={u.isActive ? 'badge-custom badge-approved' : 'badge-custom badge-rejected'}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleToggle(u._id)}
                            disabled={!!acting}
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: u.isActive ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                          >
                            {u.isActive ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(u._id)}
                            disabled={!!acting}
                            title="Delete user"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', cursor: 'pointer', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {confirmDelete && (
          <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-title">⚠️ Confirm Deletion</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setConfirmDelete(null)} className="btn-outline-custom">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete)} className="btn-danger-custom" disabled={acting === confirmDelete + 'del'}>
                  {acting === confirmDelete + 'del' ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
