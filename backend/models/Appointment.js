const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patientName: { type: String, required: true },
    doctorName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    notes: { type: String, default: '' },
    documents: [
      {
        filename: String,
        originalName: String,
        path: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    doctorInfo: { type: Object },
    patientInfo: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
