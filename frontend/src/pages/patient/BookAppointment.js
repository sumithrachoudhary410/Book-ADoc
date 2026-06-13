import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaClock, FaArrowLeft } from 'react-icons/fa';
import { getDoctorById, bookAppointment } from '../../api/api';

const TIME_SLOTS = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM'];

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ date: '', time: '', notes: '' });

  useEffect(() => {
    getDoctorById(doctorId).then(({ data }) => setDoctor(data.data)).catch(() => toast.error('Doctor not found')).finally(() => setLoading(false));
  }, [doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.time) return toast.error('Please select date and time');
    setSubmitting(true);
    try {
      await bookAppointment({ doctorId, date: form.date, time: form.time, notes: form.notes });
      toast.success('Appointment booked successfully!');
      navigate('/my-appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <div className="container-custom" style={{ maxWidth: '860px' }}>
        <Link to={`/doctors/${doctorId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 500 }}>
          <FaArrowLeft /> Back to Profile
        </Link>

        <div className="page-header">
          <h1 className="page-title">Book Appointment</h1>
          <p className="page-subtitle">Schedule a consultation with {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : ''}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }} className="book-grid">
          {/* Doctor Summary */}
          {doctor && (
            <div className="card-custom" style={{ height: 'fit-content' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div className="doctor-avatar" style={{ width: 56, height: 56, fontSize: '1.3rem' }}>
                  {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                </div>
                <div>
                  <div className="doctor-name">Dr. {doctor.firstName} {doctor.lastName}</div>
                  <div className="doctor-spec" style={{ marginTop: '0.2rem' }}>{doctor.specialization}</div>
                </div>
              </div>
              <div className="divider"></div>
              <div>
                {[
                  { label: 'Experience', val: `${doctor.experience} years` },
                  { label: 'Address', val: doctor.address },
                  { label: 'Timings', val: `${doctor.timings?.[0]} – ${doctor.timings?.[1]}` },
                ].map((r) => (
                  <div key={r.label} style={{ marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{r.label}</span>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{r.val}</div>
                  </div>
                ))}
                <div className="divider"></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONSULTATION FEE</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--success)' }}>₹{doctor.feesPerConsultation}</span>
                </div>
              </div>
            </div>
          )}

          {/* Booking Form */}
          <div className="card-custom">
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1rem' }}>
              <FaCalendarAlt style={{ color: 'var(--accent)', marginRight: '0.5rem' }} />
              Select Date & Time
            </h3>

            <form onSubmit={handleSubmit} id="book-form">
              <div className="form-group">
                <label className="form-label-custom">Appointment Date *</label>
                <input
                  id="book-date"
                  type="date"
                  className="form-control-custom"
                  min={today}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label-custom">Select Time Slot *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setForm({ ...form, time: slot })}
                      style={{
                        padding: '0.5rem 0.25rem',
                        border: `1px solid ${form.time === slot ? 'var(--accent)' : 'var(--border-light)'}`,
                        borderRadius: 'var(--radius-sm)',
                        background: form.time === slot ? 'var(--accent-glow)' : 'transparent',
                        color: form.time === slot ? 'var(--accent)' : 'var(--text-muted)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontFamily: 'inherit',
                      }}
                    >
                      <FaClock style={{ fontSize: '0.65rem', marginRight: '0.25rem' }} />
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label-custom">Symptoms / Notes (optional)</label>
                <textarea
                  id="book-notes"
                  className="form-control-custom"
                  rows={3}
                  placeholder="Describe your symptoms or reason for visit..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                id="book-submit"
                type="submit"
                className="btn-primary-custom"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                disabled={submitting}
              >
                {submitting ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width: 768px) {
          .book-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default BookAppointment;
