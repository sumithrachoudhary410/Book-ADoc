import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getNotifications, markNotificationsRead } from '../api/api';
import {
  FaHeartbeat, FaUserMd,
  FaSignOutAlt, FaUserCircle, FaBars, FaTimes,
  FaTachometerAlt
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkNotifications = async () => {
      try {
        const { data } = await getNotifications();
        const unread = data.data.filter((n) => !n.isRead);
        if (unread.length > 0) {
          unread.forEach((n) => {
            toast.info(n.message, {
              position: "top-right",
              autoClose: 6000,
              theme: "dark",
            });
          });
          await markNotificationsRead();
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };

    // Check immediately on load/login
    checkNotifications();

    // Poll every 15 seconds for real-time popups
    const interval = setInterval(checkNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'doctor') return '/doctor/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/my-appointments';
  };

  return (
    <nav className="navbar-custom">
      <div className="container-custom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Brand */}
        <Link to="/" className="navbar-brand-custom">
          <FaHeartbeat style={{ color: 'var(--danger)' }} />
          Book<span>ADoc</span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="d-none d-md-flex">
          <Link to="/" className={`nav-link-custom ${isActive('/') ? 'active' : ''}`}>Home</Link>
          <Link to="/doctors" className={`nav-link-custom ${isActive('/doctors') ? 'active' : ''}`}>
            <FaUserMd style={{ marginRight: '0.3rem' }} />Find Doctors
          </Link>
          {user && (
            <Link to={getDashboardLink()} className={`nav-link-custom`}>
              <FaTachometerAlt style={{ marginRight: '0.3rem' }} />Dashboard
            </Link>
          )}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }} className="d-none d-md-flex">
          {user ? (
            <>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaUserCircle style={{ color: 'var(--accent)' }} />
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{user.name}</span>
                <span style={{
                  background: 'var(--accent-glow)',
                  border: '1px solid rgba(56,189,248,0.2)',
                  color: 'var(--accent)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>{user.role}</span>
              </div>
              <button onClick={handleLogout} className="btn-outline-custom" style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}>
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline-custom" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Login</Link>
              <Link to="/register" className="btn-primary-custom" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="d-md-none"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.3rem', cursor: 'pointer' }}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-light)',
          padding: '1rem',
        }}>
          <Link to="/" className="nav-link-custom d-block mb-1" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/doctors" className="nav-link-custom d-block mb-1" onClick={() => setMenuOpen(false)}>Find Doctors</Link>
          {user && (
            <Link to={getDashboardLink()} className="nav-link-custom d-block mb-1" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          )}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.6rem' }}>
            {user ? (
              <button onClick={handleLogout} className="btn-outline-custom">Logout</button>
            ) : (
              <>
                <Link to="/login" className="btn-outline-custom" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary-custom" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
