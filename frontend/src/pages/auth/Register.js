import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaHeartbeat, FaUser, FaEnvelope, FaLock, FaPhone, FaUserMd } from 'react-icons/fa';
import { registerUser } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [tab, setTab] = useState('patient');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'patient' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const switchTab = (role) => {
    setTab(role);
    setForm((f) => ({ ...f, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      login(data.data);
      toast.success('Account created successfully!');
      if (data.data.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-logo">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            <FaHeartbeat style={{ color: 'var(--danger)' }} />
          </div>
          <h1>Create Account</h1>
          <p>Join BookADoc and manage your health</p>
        </div>

        {/* Role Tabs */}
        <div className="auth-tabs">
          <button id="tab-patient" className={`auth-tab ${tab === 'patient' ? 'active' : ''}`} onClick={() => switchTab('patient')}>
            <FaUser style={{ marginRight: '0.4rem' }} /> Patient
          </button>
          <button id="tab-doctor" className={`auth-tab ${tab === 'doctor' ? 'active' : ''}`} onClick={() => switchTab('doctor')}>
            <FaUserMd style={{ marginRight: '0.4rem' }} /> Doctor
          </button>
        </div>

        <form onSubmit={handleSubmit} id="register-form">
          <div className="form-group">
            <label className="form-label-custom">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <FaUser style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }} />
              <input id="reg-name" type="text" name="name" className="form-control-custom" placeholder="John Doe" value={form.name} onChange={handleChange} style={{ paddingLeft: '2.5rem' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label-custom">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }} />
              <input id="reg-email" type="email" name="email" className="form-control-custom" placeholder="john@example.com" value={form.email} onChange={handleChange} style={{ paddingLeft: '2.5rem' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label-custom">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <FaPhone style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }} />
              <input id="reg-phone" type="tel" name="phone" className="form-control-custom" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} style={{ paddingLeft: '2.5rem' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label-custom">Password *</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }} />
              <input id="reg-password" type="password" name="password" className="form-control-custom" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} style={{ paddingLeft: '2.5rem' }} />
            </div>
          </div>

          {tab === 'doctor' && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(20,184,166,0.08)',
              border: '1px solid rgba(20,184,166,0.2)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: 'var(--teal)',
              marginBottom: '1rem'
            }}>
              <FaUserMd style={{ marginRight: '0.4rem' }} />
              After registering, you'll complete your doctor profile and submit for admin approval.
            </div>
          )}

          <button id="register-submit" type="submit" className="btn-primary-custom"
            style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : `Create ${tab === 'doctor' ? 'Doctor' : 'Patient'} Account`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
