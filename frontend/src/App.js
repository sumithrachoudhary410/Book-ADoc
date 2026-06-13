import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/patient/Home';
import DoctorList from './pages/patient/DoctorList';
import DoctorProfile from './pages/patient/DoctorProfile';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorProfileEdit from './pages/doctor/DoctorProfileEdit';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminUsers from './pages/admin/AdminUsers';
import ApplyDoctor from './pages/patient/ApplyDoctor';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <div className="app-bg">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/doctors/:id" element={<DoctorProfile />} />
        <Route path="/apply-doctor" element={<ProtectedRoute roles={['patient']}><ApplyDoctor /></ProtectedRoute>} />
        <Route path="/book/:doctorId" element={<ProtectedRoute roles={['patient']}><BookAppointment /></ProtectedRoute>} />
        <Route path="/my-appointments" element={<ProtectedRoute roles={['patient']}><MyAppointments /></ProtectedRoute>} />
        <Route path="/doctor/dashboard" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute roles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
        <Route path="/doctor/profile" element={<ProtectedRoute roles={['doctor']}><DoctorProfileEdit /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/doctors" element={<ProtectedRoute roles={['admin']}><AdminDoctors /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="light"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
