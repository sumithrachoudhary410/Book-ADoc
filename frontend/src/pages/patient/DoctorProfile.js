import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaClock, FaMapMarkerAlt, FaPhone, FaGlobe, FaCalendarCheck, FaArrowLeft } from 'react-icons/fa';
import { getDoctorById } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const DoctorProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctorById(id)
      .then((res) => {
        setDoctor(res.data.data);
        setReviews(res.data.reviews || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const getInitials = (f, l) => `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase();

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!doctor) return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--text-secondary)' }}>Doctor not found</h2>
      <Link to="/doctors" className="btn-primary-custom" style={{ marginTop: '1rem', display: 'inline-flex' }}>Back to Doctors</Link>
    </div>
  );

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <div className="container-custom">
        <Link to="/doctors" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 500 }}>
          <FaArrowLeft /> Back to Doctors
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }} className="doctor-profile-grid">

          {/* Sidebar */}
          <div>
            <div className="card-custom" style={{ textAlign: 'center' }}>
              <div className="doctor-avatar" style={{ width: 100, height: 100, fontSize: '2.5rem', margin: '0 auto 1rem' }}>
                {getInitials(doctor.firstName, doctor.lastName)}
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                Dr. {doctor.firstName} {doctor.lastName}
              </h2>
              <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>{doctor.specialization}</p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', marginBottom: '1rem' }}>
                {[1,2,3,4,5].map((s) => (
                  <FaStar key={s} style={{ color: s <= Math.round(doctor.rating || 4.5) ? 'var(--warning)' : 'var(--border)', fontSize: '0.85rem' }} />
                ))}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>{doctor.rating?.toFixed(1) || '4.5'}</span>
              </div>

              <div className="divider"></div>

              <div style={{ textAlign: 'left' }}>
                {[
                  { icon: <FaClock />, label: 'Experience', val: `${doctor.experience} years` },
                  { icon: <FaMapMarkerAlt />, label: 'Location', val: doctor.address },
                  { icon: <FaPhone />, label: 'Phone', val: doctor.phone },
                  { icon: <FaCalendarCheck />, label: 'Working Days', val: doctor.workingDays && doctor.workingDays.length > 0 ? doctor.workingDays.join(', ') : 'Monday, Tuesday, Wednesday, Thursday, Friday' },
                  { icon: <FaGlobe />, label: 'Timings', val: `${doctor.timings?.[0]} – ${doctor.timings?.[1]}` },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--accent)', marginTop: '0.15rem', width: '16px', flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{item.val || 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="divider"></div>

              <div style={{ background: 'var(--accent-glow)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Consultation Fee</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)' }}>₹{doctor.feesPerConsultation}</div>
              </div>

              {user && user.role === 'patient' ? (
                <Link to={`/book/${doctor._id}`} className="btn-primary-custom" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
                  <FaCalendarCheck /> Book Appointment
                </Link>
              ) : !user ? (
                <Link to="/login" className="btn-primary-custom" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
                  Login to Book
                </Link>
              ) : null}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {doctor.bio && (
              <div className="card-custom">
                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>About</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9rem', margin: 0 }}>{doctor.bio}</p>
              </div>
            )}

            {doctor.qualifications && (
              <div className="card-custom">
                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>Qualifications</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9rem', margin: 0 }}>{doctor.qualifications}</p>
              </div>
            )}

            {doctor.certificate && (
              <div className="card-custom">
                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>Medical Certificate</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  This doctor has uploaded a medical certificate from their college as proof of verification:
                </p>
                <div>
                  <a
                    href={`${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:5000'}/${doctor.certificate}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'rgba(20, 184, 166, 0.08)',
                      border: '1px solid rgba(20, 184, 166, 0.2)',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--teal-light)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    📄 View Medical Certificate
                  </a>
                </div>
              </div>
            )}

            <div className="card-custom">
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1rem' }}>Availability</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                  const isAvailable = doctor.workingDays && doctor.workingDays.length > 0
                    ? doctor.workingDays.includes(day)
                    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day);
                  const shortDay = day.substring(0, 3);
                  return (
                    <div
                      key={day}
                      style={{
                        padding: '0.5rem 0.9rem',
                        background: isAvailable ? 'var(--accent-glow)' : 'rgba(239,68,68,0.06)',
                        border: `1px solid ${isAvailable ? 'rgba(56,189,248,0.2)' : 'rgba(239,68,68,0.15)'}`,
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        color: isAvailable ? 'var(--accent)' : 'var(--text-muted)',
                        fontWeight: 600,
                        opacity: isAvailable ? 1 : 0.6
                      }}
                    >
                      {shortDay}
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: 0 }}>
                Consulting hours: {doctor.timings?.[0]} – {doctor.timings?.[1]}
              </p>
            </div>

            {/* Reviews / Feedback Section */}
            <div className="card-custom">
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1rem' }}>Patient Reviews</h3>
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>No reviews yet for this doctor.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map((rev, idx) => (
                    <div key={idx} style={{
                      borderBottom: idx < reviews.length - 1 ? '1px solid var(--border-light)' : 'none',
                      paddingBottom: idx < reviews.length - 1 ? '1rem' : 0
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{rev.patientName || 'Anonymous'}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                          {[1,2,3,4,5].map((s) => (
                            <FaStar key={s} style={{ color: s <= rev.rating ? 'var(--warning)' : 'var(--text-muted)', fontSize: '0.75rem' }} />
                          ))}
                        </div>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.5, margin: '0.2rem 0' }}>
                        "{rev.feedback}"
                      </p>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width: 768px) {
          .doctor-profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default DoctorProfile;
