import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaSave } from 'react-icons/fa';
import { getDoctorProfile, updateDoctorProfile } from '../../api/api';

const SPECIALIZATIONS = ['Cardiologist','Dermatologist','Neurologist','Orthopedist','Pediatrician','Psychiatrist','General Physician','Gynecologist','Ophthalmologist','ENT Specialist','Urologist','Oncologist'];

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

const DoctorProfileEdit = () => {
  const [form, setForm] = useState({
    firstName:'',lastName:'',email:'',phone:'',address:'',specialization:'',experience:'',feesPerConsultation:'',bio:'',qualifications:'',website:'',timings:['09:00','17:00']
  });
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
      await updateDoctorProfile(payload);
      toast.success('Profile updated successfully!');
      // Re-convert timings back to 24h format for input display
      setForm((prev) => ({
        ...prev,
        timings: [
          convertTo24h(payload.timings[0]),
          convertTo24h(payload.timings[1])
        ]
      }));
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  const Field = ({ label, name, type = 'text', placeholder, half }) => (
    <div className="form-group" style={half ? { flex: '1 1 45%', minWidth: '180px' } : {}}>
      <label className="form-label-custom">{label}</label>
      <input type={type} name={name} className="form-control-custom" placeholder={placeholder} value={form[name] || ''} onChange={handleChange} />
    </div>
  );

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
              <Field label="First Name" name="firstName" placeholder="John" half />
              <Field label="Last Name" name="lastName" placeholder="Doe" half />
              <Field label="Email" name="email" type="email" placeholder="dr.john@hospital.com" half />
              <Field label="Phone" name="phone" placeholder="+91 9876543210" half />
              <Field label="Website (optional)" name="website" placeholder="https://yourwebsite.com" half />
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
              <Field label="Years of Experience" name="experience" type="number" placeholder="5" half />
              <Field label="Consultation Fee (₹)" name="feesPerConsultation" type="number" placeholder="500" half />
              <Field label="Address / Location" name="address" placeholder="City, State" half />
            </div>
            <div className="form-group">
              <label className="form-label-custom">Qualifications</label>
              <textarea name="qualifications" className="form-control-custom" rows={2} placeholder="MBBS, MD - Cardiology, AIIMS Delhi" value={form.qualifications || ''} onChange={handleChange} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label-custom">Professional Bio</label>
              <textarea name="bio" className="form-control-custom" rows={3} placeholder="Write a short professional bio..." value={form.bio || ''} onChange={handleChange} style={{ resize: 'vertical' }} />
            </div>
          </div>

          {/* Timings */}
          <div className="card-custom" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Consultation Timings</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
                <label className="form-label-custom">From</label>
                <input type="time" className="form-control-custom" value={form.timings?.[0] || '09:00'} onChange={(e) => handleTiming(0, e.target.value)} />
              </div>
              <div style={{ color: 'var(--text-muted)', paddingTop: '1.5rem' }}>—</div>
              <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
                <label className="form-label-custom">To</label>
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
