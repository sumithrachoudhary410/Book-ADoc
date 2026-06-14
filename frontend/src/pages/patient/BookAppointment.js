import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaClock, FaArrowLeft } from 'react-icons/fa';
import { getDoctorById, bookAppointment, getBookedSlots } from '../../api/api';

const TIME_SLOTS = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM'];

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ date: '', time: '', notes: '' });
  const [bookedSlots, setBookedSlots] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  const getDayOfWeekName = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    const options = { weekday: 'long' };
    return dateObj.toLocaleDateString('en-US', options);
  };

  const selectedDayName = getDayOfWeekName(form.date);
  const isSelectedDayOff = selectedDayName && doctor
    ? !(doctor.workingDays && doctor.workingDays.length > 0
        ? doctor.workingDays.includes(selectedDayName)
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(selectedDayName))
    : false;

  useEffect(() => {
    getDoctorById(doctorId).then(({ data }) => setDoctor(data.data)).catch(() => toast.error('Doctor not found')).finally(() => setLoading(false));
  }, [doctorId]);

  useEffect(() => {
    if (form.date && doctorId) {
      setLoadingSlots(true);
      getBookedSlots(doctorId, form.date)
        .then(({ data }) => {
          setBookedSlots(data.bookedSlots || {});
        })
        .catch((err) => {
          console.error('Failed to load booked slots', err);
        })
        .finally(() => {
          setLoadingSlots(false);
        });
    } else {
      setBookedSlots({});
    }
    // Reset time selection when date changes
    setForm((f) => ({ ...f, time: '' }));
  }, [form.date, doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.time) return toast.error('Please select date and time');
    
    // Safety check: is the slot fully booked?
    const currentBookings = bookedSlots[form.time] || 0;
    if (currentBookings >= 2) {
      return toast.error('This time slot is already fully booked.');
    }

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
                  { label: 'Working Days', val: doctor.workingDays && doctor.workingDays.length > 0 ? doctor.workingDays.join(', ') : 'Monday, Tuesday, Wednesday, Thursday, Friday' },
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
                {isSelectedDayOff && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.4rem 0.75rem',
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.25)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--warning)',
                    fontSize: '0.8rem',
                    fontWeight: 500
                  }}>
                    ⚠️ Note: Dr. {doctor?.firstName} is not usually available on {selectedDayName}s.
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label-custom">Select Time Slot *</label>
                {!form.date ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Please select a date first to see available slots.
                  </div>
                ) : loadingSlots ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div className="spinner" style={{ width: 14, height: 14, borderWidth: '2px' }}></div> Loading slots...
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {TIME_SLOTS.map((slot) => {
                      const bookingsCount = bookedSlots[slot] || 0;
                      const isFull = bookingsCount >= 2;
                      const isPartiallyBooked = bookingsCount === 1;
                      const isSelected = form.time === slot;

                      let border = 'var(--border-light)';
                      let bg = 'transparent';
                      let color = 'var(--text-muted)';
                      let badgeText = '';
                      let badgeColor = '';

                      if (isFull) {
                        border = 'rgba(239, 68, 68, 0.2)';
                        bg = 'rgba(239, 68, 68, 0.03)';
                        color = 'rgba(255, 255, 255, 0.25)';
                        badgeText = 'Full';
                        badgeColor = 'var(--danger)';
                      } else if (isPartiallyBooked) {
                        if (isSelected) {
                          border = 'var(--accent)';
                          bg = 'var(--accent-glow)';
                          color = 'var(--accent)';
                        } else {
                          border = 'rgba(245, 158, 11, 0.4)';
                          bg = 'rgba(245, 158, 11, 0.03)';
                          color = 'var(--text-secondary)';
                        }
                        badgeText = '1 left';
                        badgeColor = 'var(--warning)';
                      } else {
                        if (isSelected) {
                          border = 'var(--accent)';
                          bg = 'var(--accent-glow)';
                          color = 'var(--accent)';
                        }
                      }

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isFull}
                          onClick={() => setForm({ ...form, time: slot })}
                          style={{
                            padding: '0.45rem 0.25rem',
                            border: `1px solid ${border}`,
                            borderRadius: 'var(--radius-sm)',
                            background: bg,
                            color: color,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: isFull ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            fontFamily: 'inherit',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.1rem',
                            position: 'relative'
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <FaClock style={{ fontSize: '0.65rem' }} />
                            {slot}
                          </span>
                          {badgeText && (
                            <span style={{
                              fontSize: '0.6rem',
                              color: badgeColor,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              marginTop: '0.05rem',
                              letterSpacing: '0.02em'
                            }}>
                              {badgeText}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
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
