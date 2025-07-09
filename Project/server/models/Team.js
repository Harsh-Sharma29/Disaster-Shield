import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['fire', 'medical', 'search', 'water', 'hazmat', 'logistics', 'other']
  },
  members: {
    type: Number,
    required: true,
    min: 1
  },
  leader: {
    name: {
      type: String,
      required: true
    },
    contact: {
      type: String,
      required: true
    },
    email: {
      type: String
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'standby', 'off-duty'],
    default: 'standby'
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  currentMission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident'
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

const Team = mongoose.model('Team', teamSchema);

export default Team;