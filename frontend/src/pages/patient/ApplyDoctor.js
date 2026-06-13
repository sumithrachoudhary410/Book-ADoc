import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserMd, FaSave } from 'react-icons/fa';
import { applyAsDoctor } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const SPECIALIZATIONS = ['Cardiologist','Dermatologist','Neurologist','Orthopedist','Pediatrician','Psychiatrist','General Physician','Gynecologist','Ophthalmologist','ENT Specialist','Urologist','Oncologist'];

const ApplyDoctor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: user?.email || '', phone: '', address: '',
    specialization: '', experience: '', feesPerConsultation: '', bio: '', qualifications: '',
    website: '', timings: ['09:00', '17:00']
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['firstName','lastName','email','phone','address','specialization','experience','feesPerConsultation'];
    for (const f of required) {
      if (!form[f]) return toast.error(`Please fill in ${f}`);
    }
    setLoading(true);
    try {
      await applyAsDoctor(form);
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

          <button id="apply-submit" type="submit" className="btn-primary-custom" style={{ padding: '0.8rem 2rem' }} disabled={loading}>
            <FaSave /> {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyDoctor;
