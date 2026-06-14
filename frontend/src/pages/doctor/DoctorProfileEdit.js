import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaSave } from 'react-icons/fa';
import { getDoctorProfile, updateDoctorProfile } from '../../api/api';

const SPECIALIZATIONS = ['Cardiologist','Dermatologist','Neurologist','Orthopedist','Pediatrician','Psychiatrist','General Physician','Gynecologist','Ophthalmologist','ENT Specialist','Urologist','Oncologist'];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const convertTo24h = (timeStr) => {
  if (!timeStr) return '';
  if (!timeStr.includes('AM') && !timeStr.includes('PM')) return timeStr;
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

const convertTo12h = (timeStr) => {
  if (!timeStr) return '';
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
  let [hours, minutes] = timeStr.split(':');
  const modifier = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
  hours = parseInt(hours, 10) % 12;
  hours = hours ? hours : 12;
  return `${hours.toString().padStart(2, '0')}:${minutes} ${modifier}`;
};

const Field = ({ label, name, type = 'text', placeholder, half, value, onChange }) => (
  <div className="form-group" style={half ? { flex: '1 1 45%', minWidth: '180px' } : {}}>
    <label className="form-label-custom">{label}</label>
    <input type={type} name={name} className="form-control-custom" placeholder={placeholder} value={value || ''} onChange={onChange} />
  </div>
);

const DoctorProfileEdit = () => {
  const [form, setForm] = useState({
    firstName:'',lastName:'',email:'',phone:'',address:'',specialization:'',experience:'',feesPerConsultation:'',bio:'',qualifications:'',website:'',timings:['09:00','17:00'],
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  });
  const [certificateFile, setCertificateFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoctorProfile().then(({ data }) => {
      if (data.data) {
        const docData = { ...data.data };
        if (docData.timings) {
          docData.timings = [
            convertTo24h(docData.timings[0]),
            convertTo24h(docData.timings[1])
          ];
        }
        if (!docData.workingDays || docData.workingDays.length === 0) {
          docData.workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        }
        setForm((prev) => ({ ...prev, ...docData }));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

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
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.timings) {
        payload.timings = [
          convertTo12h(payload.timings[0]),
          convertTo12h(payload.timings[1])
        ];
      }

      const formData = new FormData();
      Object.keys(payload).forEach((key) => {
        if (key === 'timings' || key === 'workingDays') {
          formData.append(key, JSON.stringify(payload[key]));
        } else if (payload[key] !== undefined && payload[key] !== null) {
          formData.append(key, payload[key]);
        }
      });

      if (certificateFile) {
        formData.append('certificate', certificateFile);
      }

      const { data } = await updateDoctorProfile(formData);
      toast.success('Profile updated successfully!');
      
      if (data.data) {
        const docData = { ...data.data };
        if (docData.timings) {
          docData.timings = [
            convertTo24h(docData.timings[0]),
            convertTo24h(docData.timings[1])
          ];
        }
        if (!docData.workingDays || docData.workingDays.length === 0) {
          docData.workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        }
        setForm((prev) => ({ ...prev, ...docData }));
      }
      setCertificateFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <div className="container-custom" style={{ maxWidth: '800px' }}>
        <div className="page-header">
          <h1 className="page-title">Edit Profile</h1>
          <p className="page-subtitle">Keep your professional information up to date</p>
        </div>

        <form onSubmit={handleSubmit} id="doctor-profile-form">
          {/* Personal Info */}
          <div className="card-custom" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Personal Information</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Field label="First Name" name="firstName" placeholder="John" half value={form.firstName} onChange={handleChange} />
              <Field label="Last Name" name="lastName" placeholder="Doe" half value={form.lastName} onChange={handleChange} />
              <Field label="Email" name="email" type="email" placeholder="dr.john@hospital.com" half value={form.email} onChange={handleChange} />
              <Field label="Phone" name="phone" placeholder="+91 9876543210" half value={form.phone} onChange={handleChange} />
              <Field label="Website (optional)" name="website" placeholder="https://yourwebsite.com" half value={form.website} onChange={handleChange} />
            </div>
          </div>

          {/* Professional Info */}
          <div className="card-custom" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Professional Information</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1 1 45%', minWidth: '180px' }}>
                <label className="form-label-custom">Specialization</label>
                <select name="specialization" className="form-control-custom" value={form.specialization} onChange={handleChange}>
                  <option value="">Select Specialization</option>
                  {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Field label="Years of Experience" name="experience" type="number" placeholder="5" half value={form.experience} onChange={handleChange} />
              <Field label="Consultation Fee (₹)" name="feesPerConsultation" type="number" placeholder="500" half value={form.feesPerConsultation} onChange={handleChange} />
              <Field label="Address / Location" name="address" placeholder="City, State" half value={form.address} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label-custom">Qualifications</label>
              <textarea name="qualifications" className="form-control-custom" rows={2} placeholder="MBBS, MD - Cardiology, AIIMS Delhi" value={form.qualifications || ''} onChange={handleChange} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label-custom">Professional Bio</label>
              <textarea name="bio" className="form-control-custom" rows={3} placeholder="Write a short professional bio..." value={form.bio || ''} onChange={handleChange} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label-custom">Medical Certificate (Verification Proof)</label>
              {form.certificate && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <a
                    href={`${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:5000'}/${form.certificate}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--accent)',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: 'rgba(56, 189, 248, 0.08)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    📄 View Uploaded Certificate
                  </a>
                  <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    (Upload a new certificate below to replace the current one)
                  </span>
                </div>
              )}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setCertificateFile(e.target.files[0])}
                className="form-control-custom"
                style={{ padding: '0.5rem' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Supported formats: PDF, JPG, JPEG, PNG. Keep your medical college degree or council certificate updated as verification proof.
              </p>
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

          <button id="save-profile" type="submit" className="btn-primary-custom" style={{ padding: '0.8rem 2rem' }} disabled={saving}>
            <FaSave /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfileEdit;
