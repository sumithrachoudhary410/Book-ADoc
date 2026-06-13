import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserMd, FaSave } from 'react-icons/fa';
import { applyAsDoctor } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const SPECIALIZATIONS = ['Cardiologist','Dermatologist','Neurologist','Orthopedist','Pediatrician','Psychiatrist','General Physician','Gynecologist','Ophthalmologist','ENT Specialist','Urologist','Oncologist'];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const convertTo12h = (timeStr) => {
  if (!timeStr) return '';
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
  let [hours, minutes] = timeStr.split(':');
  const modifier = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
  hours = parseInt(hours, 10) % 12;
  hours = hours ? hours : 12;
  return `${hours.toString().padStart(2, '0')}:${minutes} ${modifier}`;
};

const ApplyDoctor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: user?.email || '', phone: '', address: '',
    specialization: '', experience: '', feesPerConsultation: '', bio: '', qualifications: '',
    website: '', timings: ['09:00', '17:00'],
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleTiming = (idx, val) => {
    const t = [...form.timings];
    t[idx] = val;
    setForm({ ...form, timings: t });
  };

  const handleDayToggle = (day) => {
    const currentDays = form.workingDays || [];
    let updatedDays;
    if (currentDays.includes(day)) {
      updatedDays = currentDays.filter((d) => d !== day);
    } else {
      updatedDays = [...currentDays, day];
    }
    setForm({ ...form, workingDays: updatedDays });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['firstName','lastName','email','phone','address','specialization','experience','feesPerConsultation'];
    for (const f of required) {
      if (!form[f]) return toast.error(`Please fill in ${f}`);
    }
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.timings) {
        payload.timings = [
          convertTo12h(payload.timings[0]),
          convertTo12h(payload.timings[1])
        ];
      }
      await applyAsDoctor(payload);
      toast.success('Application submitted! Pending admin approval.');
      navigate('/doctor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <div className="container-custom" style={{ maxWidth: '780px' }}>
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div className="stat-icon teal" style={{ width: 44, height: 44 }}><FaUserMd /></div>
            <h1 className="page-title" style={{ margin: 0 }}>Apply as Doctor</h1>
          </div>
          <p className="page-subtitle">Fill out your professional details to join the platform</p>
        </div>

        <div style={{
          background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)',
          borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem',
          fontSize: '0.83rem', color: 'var(--teal-light)'
        }}>
          📋 Your application will be reviewed by our admin team. You'll be notified once approved.
        </div>

        <form onSubmit={handleSubmit} id="apply-doctor-form">
          <div className="card-custom" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Personal Information</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                { label: 'First Name *', name: 'firstName', placeholder: 'John' },
                { label: 'Last Name *', name: 'lastName', placeholder: 'Doe' },
                { label: 'Email *', name: 'email', placeholder: 'dr@hospital.com' },
                { label: 'Phone *', name: 'phone', placeholder: '+91 9876543210' },
              ].map((f) => (
                <div key={f.name} className="form-group" style={{ flex: '1 1 45%', minWidth: '200px' }}>
                  <label className="form-label-custom">{f.label}</label>
                  <input type="text" name={f.name} className="form-control-custom" placeholder={f.placeholder} value={form[f.name]} onChange={handleChange} />
                </div>
              ))}
            </div>
          </div>

          <div className="card-custom" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Professional Details</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1 1 45%', minWidth: '200px' }}>
                <label className="form-label-custom">Specialization *</label>
                <select name="specialization" className="form-control-custom" value={form.specialization} onChange={handleChange}>
                  <option value="">Select Specialization</option>
                  {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: '1 1 45%', minWidth: '200px' }}>
                <label className="form-label-custom">Years of Experience *</label>
                <input type="number" name="experience" className="form-control-custom" placeholder="e.g. 5" value={form.experience} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ flex: '1 1 45%', minWidth: '200px' }}>
                <label className="form-label-custom">Consultation Fee (₹) *</label>
                <input type="number" name="feesPerConsultation" className="form-control-custom" placeholder="e.g. 500" value={form.feesPerConsultation} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ flex: '1 1 45%', minWidth: '200px' }}>
                <label className="form-label-custom">Address / Location *</label>
                <input type="text" name="address" className="form-control-custom" placeholder="City, State" value={form.address} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label-custom">Qualifications</label>
              <textarea name="qualifications" className="form-control-custom" rows={2} placeholder="MBBS, MD - Cardiology, AIIMS Delhi" value={form.qualifications} onChange={handleChange} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label-custom">Professional Bio</label>
              <textarea name="bio" className="form-control-custom" rows={3} placeholder="Tell patients about your expertise and approach..." value={form.bio} onChange={handleChange} style={{ resize: 'vertical' }} />
            </div>
          </div>

          {/* Timings & Working Days */}
          <div className="card-custom" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Availability Settings</h3>
            
            {/* Working Days */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label-custom" style={{ marginBottom: '0.75rem' }}>Working Days</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {DAYS_OF_WEEK.map((day) => {
                  const isChecked = form.workingDays?.includes(day);
                  return (
                    <label key={day} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: isChecked ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isChecked ? 'var(--accent)' : 'var(--border-light)'}`,
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: isChecked ? 'var(--accent)' : 'var(--text-secondary)',
                      transition: 'all 0.2s ease-in-out'
                    }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleDayToggle(day)}
                        style={{ display: 'none' }}
                      />
                      {day}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Timings */}
            <label className="form-label-custom">Working Hours</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
                <label className="form-label-custom" style={{ fontSize: '0.75rem', opacity: 0.8 }}>From</label>
                <input type="time" className="form-control-custom" value={form.timings?.[0] || '09:00'} onChange={(e) => handleTiming(0, e.target.value)} />
              </div>
              <div style={{ color: 'var(--text-muted)', paddingTop: '1.5rem' }}>—</div>
              <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
                <label className="form-label-custom" style={{ fontSize: '0.75rem', opacity: 0.8 }}>To</label>
                <input type="time" className="form-control-custom" value={form.timings?.[1] || '17:00'} onChange={(e) => handleTiming(1, e.target.value)} />
              </div>
            </div>
          </div>

          <button id="apply-submit" type="submit" className="btn-primary-custom" style={{ padding: '0.8rem 2rem' }} disabled={loading}>
            <FaSave /> {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyDoctor;
