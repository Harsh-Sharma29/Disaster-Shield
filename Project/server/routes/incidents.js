import express from 'express';
import Incident from '../models/Incident.js';

const router = express.Router();

// Get all incidents
router.get('/', async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new incident
router.post('/', async (req, res) => {
  const incident = new Incident({
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  try {
    const newIncident = await incident.save();
    res.status(201).json(newIncident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update incident
router.patch('/:id', async (req, res) => {
  try {
    const updatedIncident = await Incident.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedIncident) return res.status(404).json({ message: 'Incident not found' });
    res.json(updatedIncident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete incident
router.delete('/:id', async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    res.json({ message: 'Incident deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get incidents by severity
router.get('/severity/:level', async (req, res) => {
  try {
    const incidents = await Incident.find({ severity: req.params.level }).sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get incidents by type
router.get('/type/:type', async (req, res) => {
  try {
    const incidents = await Incident.find({ type: req.params.type }).sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get incidents by status
router.get('/status/:status', async (req, res) => {
  try {
    const incidents = await Incident.find({ status: req.params.status }).sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get incidents near a location
router.get('/near', async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10000 } = req.query; // maxDistance in meters
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    const incidents = await Incident.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });
    
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const incidentRoutes = router;
