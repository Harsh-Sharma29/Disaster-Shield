import express from 'express';
import Resource from '../models/Resource.js';

const router = express.Router();

// Get all resources
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find().sort({ name: 1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get resource by ID
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new resource
router.post('/', async (req, res) => {
  const resource = new Resource({
    ...req.body,
    lastUpdated: new Date(),
    createdAt: new Date()
  });

  try {
    const newResource = await resource.save();
    res.status(201).json(newResource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update resource
router.patch('/:id', async (req, res) => {
  try {
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true }
    );
    if (!updatedResource) return res.status(404).json({ message: 'Resource not found' });
    res.json(updatedResource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete resource
router.delete('/:id', async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get resources by status
router.get('/status/:status', async (req, res) => {
  try {
    const resources = await Resource.find({ status: req.params.status }).sort({ name: 1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get resources by type
router.get('/type/:type', async (req, res) => {
  try {
    const resources = await Resource.find({ type: req.params.type }).sort({ name: 1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available resources
router.get('/available/:type?', async (req, res) => {
  try {
    const query = { status: 'available' };
    if (req.params.type) query.type = req.params.type;
    
    const resources = await Resource.find(query).sort({ name: 1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign resource to team
router.post('/:id/assign-to-team', async (req, res) => {
  try {
    const { teamId } = req.body;
    
    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required' });
    }
    
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      { 
        assignedToTeam: teamId,
        status: 'deployed',
        lastUpdated: new Date()
      },
      { new: true }
    );
    
    if (!updatedResource) return res.status(404).json({ message: 'Resource not found' });
    res.json(updatedResource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Assign resource to incident
router.post('/:id/assign-to-incident', async (req, res) => {
  try {
    const { incidentId } = req.body;
    
    if (!incidentId) {
      return res.status(400).json({ message: 'Incident ID is required' });
    }
    
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      { 
        assignedToIncident: incidentId,
        status: 'deployed',
        lastUpdated: new Date()
      },
      { new: true }
    );
    
    if (!updatedResource) return res.status(404).json({ message: 'Resource not found' });
    res.json(updatedResource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Return resource (mark as available)
router.post('/:id/return', async (req, res) => {
  try {
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      { 
        assignedToTeam: null,
        assignedToIncident: null,
        status: 'available',
        lastUpdated: new Date()
      },
      { new: true }
    );
    
    if (!updatedResource) return res.status(404).json({ message: 'Resource not found' });
    res.json(updatedResource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export const resourceRoutes = router;