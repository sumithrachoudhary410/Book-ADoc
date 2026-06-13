import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaStar, FaClock, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { getDoctors, getSpecializations } from '../../api/api';

const DoctorList = () => {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedSpec, setSelectedSpec] = useState(searchParams.get('specialization') || '');
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async (overrideSearch, overrideSpec) => {
    setLoading(true);
    try {
      const params = {};
      const s = overrideSearch !== undefined ? overrideSearch : search;
      const sp = overrideSpec !== undefined ? overrideSpec : selectedSpec;
      if (s) params.search = s;
      if (sp) params.specialization = sp;
      const { data } = await getDoctors(params);
      setDoctors(data.data);
    } catch (err) { setDoctors([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    getSpecializations().then(({ data }) => setSpecializations(data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (selectedSpec) params.specialization = selectedSpec;
        const { data } = await getDoctors(params);
        setDoctors(data.data);
      } catch (err) { setDoctors([]); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [search, selectedSpec]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(search, selectedSpec);
  };

  const getInitials = (f, l) => `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase();

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <div className="container-custom">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Find a Doctor</h1>
          <p className="page-subtitle">Browse our network of {doctors.length} verified healthcare professionals</p>
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '0.5rem', minWidth: '260px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }} />
              <input
                id="doctor-search"
                type="text"
                className="form-control-custom"
                placeholder="Search by name or specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            <button type="submit" className="btn-primary-custom">Search</button>
          </form>
        </div>

        {/* Specialization Chips */}
        <div className="filter-bar">
          <button id="filter-all" className={`filter-chip ${selectedSpec === '' ? 'active' : ''}`} onClick={() => setSelectedSpec('')}>
            All Specializations
          </button>
          {specializations.map((s) => (
            <button key={s} className={`filter-chip ${selectedSpec === s ? 'active' : ''}`} onClick={() => setSelectedSpec(s)}>
              {s}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : doctors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No doctors found</h3>
            <p>Try a different search term or specialization</p>
          </div>
        ) : (
          <div className="grid-3">
            {doctors.map((doc) => (
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
                    <div className="info-row"><FaClock /> {doc.experience} yrs experience · {doc.timings?.[0]} – {doc.timings?.[1]}</div>
                    <div className="info-row"><FaCalendarAlt style={{ color: 'var(--teal)' }} /> {doc.workingDays && doc.workingDays.length > 0 ? doc.workingDays.map(d => d.substring(0, 3)).join(', ') : 'Mon, Tue, Wed, Thu, Fri'}</div>
                    <div className="info-row"><FaMapMarkerAlt /> {doc.address || 'N/A'}</div>
                    <div className="info-row"><FaStar style={{ color: 'var(--warning)' }} /> {doc.rating?.toFixed(1) || '4.5'}</div>
                    {doc.bio && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                        {doc.bio.substring(0, 80)}{doc.bio.length > 80 ? '...' : ''}
                      </p>
                    )}
                  </div>
                  <div className="doctor-card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.95rem' }}>₹{doc.feesPerConsultation}</span>
                    <span className="btn-primary-custom" style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem' }}>Book Now</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorList;
