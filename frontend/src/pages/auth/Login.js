import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaHeartbeat, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { loginUser } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data.data);
      toast.success(`Welcome back, ${data.data.name}!`);
      if (data.data.role === 'admin') navigate('/admin/dashboard');
      else if (data.data.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            <FaHeartbeat style={{ color: 'var(--danger)' }} />
          </div>
          <h1>BookADoc</h1>
          <p>Sign in to your healthcare account</p>
        </div>

        <form onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label className="form-label-custom">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{
                position: 'absolute', left: '0.9rem', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem'
              }} />
              <input
                id="login-email"
                type="email"
                name="email"
                className="form-control-custom"
                placeholder="doctor@hospital.com"
                value={form.email}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label-custom">Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{
                position: 'absolute', left: '0.9rem', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem'
              }} />
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                name="password"
                className="form-control-custom"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: '0.9rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem'
                }}
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn-primary-custom"
            style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Create account
            </Link>
          </p>
        </div>


      </div>
    </div>
  );
};

export default Login;
