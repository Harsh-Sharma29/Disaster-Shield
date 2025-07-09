import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['vehicle', 'equipment', 'facility', 'personnel', 'supplies', 'other']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  quantityUnit: {
    type: String,
    default: 'units'
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'deployed', 'maintenance'],
    default: 'available'
  },
  assignedToTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  assignedToIncident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;