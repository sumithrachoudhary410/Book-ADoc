import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeartbeat, FaCalendarCheck, FaShieldAlt, FaSearch, FaStar, FaClock, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import { getDoctors } from '../../api/api';

const SPECIALIZATIONS = ['Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedist', 'Pediatrician', 'Psychiatrist', 'General Physician', 'Gynecologist'];

const Home = () => {
  const [search, setSearch] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctors().then(({ data }) => {
      setFeatured(data.data.slice(0, 6));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getInitials = (f, l) => `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase();

  return (
    <div>
      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="container-custom">
          <div className="hero-badge">
            <FaHeartbeat style={{ color: 'var(--danger)' }} /> Healthcare, reimagined
          </div>
          <h1 className="hero-title">
            Your Health, Our<br /><span className="highlight">Top Priority</span>
          </h1>
          <p className="hero-subtitle">
            Connect with certified doctors, schedule appointments, and manage your healthcare journey — all in one place.
          </p>

          {/* Search */}
          <div className="search-bar" style={{ margin: '0 auto 1rem' }}>
            <FaSearch style={{ color: 'var(--text-muted)', margin: '0 0.5rem', flexShrink: 0 }} />
            <input
              id="hero-search"
              type="text"
              placeholder="Search doctors, specializations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Link
              to={`/doctors?search=${search}`}
              className="btn-primary-custom"
              style={{ borderRadius: '16px', padding: '0.55rem 1.25rem', whiteSpace: 'nowrap' }}
            >
              Search
            </Link>
          </div>

          {/* Quick spec filters */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
            {SPECIALIZATIONS.slice(0, 5).map((s) => (
              <Link key={s} to={`/doctors?specialization=${s}`} className="filter-chip" style={{ textDecoration: 'none' }}>
                {s}
              </Link>
            ))}
          </div>

          {/* Hero Stats */}
          <div className="hero-stats">
            <div className="hero-stat-item">
              <div className="hero-stat-num">500+</div>
              <div className="hero-stat-lbl">Verified Doctors</div>
            </div>
            <div className="hero-stat-item">
              <div className="hero-stat-num">10K+</div>
              <div className="hero-stat-lbl">Appointments Booked</div>
            </div>
            <div className="hero-stat-item">
              <div className="hero-stat-num">50+</div>
              <div className="hero-stat-lbl">Specializations</div>
            </div>
            <div className="hero-stat-item">
              <div className="hero-stat-num">4.8★</div>
              <div className="hero-stat-lbl">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '3rem 0', background: 'rgba(255,255,255,0.02)' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 className="section-title" style={{ textAlign: 'center' }}>How It Works</h2>
            <div className="section-line" style={{ margin: '0.5rem auto 0' }}></div>
          </div>
          <div className="grid-3">
            {[
              { icon: '🔍', title: 'Search Doctors', desc: 'Browse our network of certified healthcare professionals by specialization, location, or name.', color: 'blue' },
              { icon: '📅', title: 'Book Appointment', desc: 'Choose your preferred date and time slot. Instantly confirm your appointment online.', color: 'teal' },
              { icon: '💊', title: 'Get Consultation', desc: 'Visit your doctor, upload documents, and receive prescriptions — all managed digitally.', color: 'purple' },
            ].map((item) => (
              <div key={item.title} className="feature-card">
                <div className={`feature-icon stat-icon ${item.color}`} style={{ width: 60, height: 60, fontSize: '1.5rem' }}>
                  {item.icon}
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED DOCTORS ── */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container-custom">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="section-title">Featured Doctors</h2>
              <div className="section-line"></div>
            </div>
            <Link to="/doctors" className="btn-outline-custom" style={{ fontSize: '0.85rem' }}>
              View All <FaArrowRight style={{ fontSize: '0.75rem' }} />
            </Link>
          </div>

          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div></div>
          ) : featured.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👨‍⚕️</div>
              <h3>No doctors available yet</h3>
              <p>Doctors will appear here once approved by admin</p>
            </div>
          ) : (
            <div className="grid-3">
              {featured.map((doc) => (
                <Link key={doc._id} to={`/doctors/${doc._id}`} style={{ textDecoration: 'none' }}>
                  <div className="doctor-card">
                    <div className="doctor-card-header">
                      <div className="doctor-avatar">{getInitials(doc.firstName, doc.lastName)}</div>
                      <div>
                        <div className="doctor-name">Dr. {doc.firstName} {doc.lastName}</div>
                        <div className="doctor-spec">{doc.specialization}</div>
                      </div>
                    </div>
                    <div className="doctor-card-body">
                      <div className="info-row"><FaClock /> {doc.experience} yrs experience</div>
                      <div className="info-row"><FaMapMarkerAlt /> {doc.address}</div>
                      <div className="info-row"><FaStar style={{ color: 'var(--warning)' }} /> {doc.rating?.toFixed(1) || '4.5'} rating</div>
                    </div>
                    <div className="doctor-card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.95rem' }}>
                        ₹{doc.feesPerConsultation}
                      </span>
                      <span className="btn-primary-custom" style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem' }}>
                        Book Now
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY US ── */}
      <section style={{ padding: '3rem 0', background: 'rgba(255,255,255,0.02)' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Why BookADoc?</h2>
            <div className="section-line" style={{ margin: '0.5rem auto 0' }}></div>
          </div>
          <div className="grid-4">
            {[
              { icon: <FaShieldAlt />, title: 'Verified Doctors', desc: 'All doctors are verified by our admin team', color: 'blue' },
              { icon: <FaCalendarCheck />, title: 'Easy Scheduling', desc: 'Book appointments in under 60 seconds', color: 'teal' },
              { icon: '📄', title: 'Secure Records', desc: 'Upload and manage your medical documents', color: 'purple' },
              { icon: '🔔', title: 'Notifications', desc: 'Real-time updates on your appointment status', color: 'green' },
            ].map((f) => (
              <div key={f.title} className="feature-card" style={{ textAlign: 'left' }}>
                <div className={`stat-icon ${f.color}`} style={{ width: 44, height: 44, fontSize: '1.1rem', marginBottom: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '0.95rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.8rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container-custom" style={{ textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(20,184,166,0.1))',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2rem',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', letterSpacing: '-0.5px' }}>
              Ready to take control of your health?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
              Join thousands of patients who manage their appointments effortlessly.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-primary-custom" style={{ padding: '0.8rem 2rem', fontSize: '0.95rem' }}>
                Get Started Free
              </Link>
              <Link to="/doctors" className="btn-outline-custom" style={{ padding: '0.8rem 2rem', fontSize: '0.95rem' }}>
                Browse Doctors
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-light)', padding: '1.5rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
          © 2024 BookADoc. All rights reserved. Built with ❤️ for better healthcare.
        </p>
      </footer>
    </div>
  );
};

export default Home;
