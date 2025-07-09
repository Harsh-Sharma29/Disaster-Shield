import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['fire', 'flood', 'earthquake', 'storm', 'landslide', 'other']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  status: {
    type: String,
    required: true,
    default: 'reported',
    enum: ['reported', 'inProgress', 'resolved', 'closed']
  },
  reportedBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add GeoJSON index for location queries
incidentSchema.index({ coordinates: '2dsphere' });

const Incident = mongoose.model('Incident', incidentSchema);

export default Incident;