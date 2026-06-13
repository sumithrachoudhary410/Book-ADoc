# Book a Doctor — MERN Healthcare Booking Platform

A full-stack healthcare booking platform connecting patients, doctors, and administrators. Built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js).

[![Deploy to Render](https://render.com/images/deploy-to-render.svg)](https://render.com/deploy?repo=https://github.com/sumithrachoudhary410/Book-ADoc)

## Features

- 🔐 **JWT Authentication** with role-based access (Patient, Doctor, Admin)
- 👨‍⚕️ **Doctor Browsing** — Search and filter by specialization
- 📅 **Appointment Booking** — Time slot selection, notes
- 📄 **Document Upload** — Secure file uploads per appointment
- 🛡️ **Admin Dashboard** — Approve/reject doctors, manage users
- 🔔 **Notifications** — In-app status updates
- 📱 **Responsive Design** — Mobile-friendly dark-mode UI

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router v6, Axios, Bootstrap 5 |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT + bcryptjs |
| File Upload | Multer |

## Getting Started

### Prerequisites

- Node.js v16+
- MongoDB (local or Atlas)
- npm

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (already included):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/book-a-doctor
JWT_SECRET=bookaDoctor_super_secret_jwt_key_2024
NODE_ENV=development
```

Seed the admin user:
```bash
node seedAdmin.js
```

Start backend server:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:3000`

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@bookadoc.com | admin123 |

## Project Structure

```
book-a-doctor/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, upload middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── uploads/         # Uploaded files
│   ├── seedAdmin.js     # Admin seed script
│   └── server.js        # Entry point
└── frontend/
    └── src/
        ├── api/         # Axios API client
        ├── components/  # Navbar
        ├── context/     # AuthContext
        └── pages/
            ├── auth/    # Login, Register
            ├── patient/ # Home, Doctors, Book, My Appointments
            ├── doctor/  # Dashboard, Appointments, Profile
            └── admin/   # Dashboard, Doctors, Users
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get profile

### Doctors
- `GET /api/doctors` — List approved doctors
- `GET /api/doctors/:id` — Doctor profile
- `POST /api/doctors/apply` — Apply as doctor

### Appointments
- `POST /api/appointments` — Book appointment
- `GET /api/appointments/patient` — Patient's appointments
- `GET /api/appointments/doctor` — Doctor's appointments
- `PUT /api/appointments/:id/status` — Update status

### Admin
- `GET /api/admin/stats` — Dashboard stats
- `GET /api/admin/users` — All users
- `GET /api/admin/doctors` — All doctors
- `PUT /api/admin/doctors/:id/status` — Approve/reject doctor
