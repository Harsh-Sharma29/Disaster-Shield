import express from 'express';
import Team from '../models/Team.js';

const router = express.Router();

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().sort({ name: 1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get team by ID
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new team
router.post('/', async (req, res) => {
  const team = new Team({
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  try {
    const newTeam = await team.save();
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update team
router.patch('/:id', async (req, res) => {
  try {
    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedTeam) return res.status(404).json({ message: 'Team not found' });
    res.json(updatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete team
router.delete('/:id', async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json({ message: 'Team deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get teams by status
router.get('/status/:status', async (req, res) => {
  try {
    const teams = await Team.find({ status: req.params.status }).sort({ name: 1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get teams by type
router.get('/type/:type', async (req, res) => {
  try {
    const teams = await Team.find({ type: req.params.type }).sort({ name: 1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign team to mission
router.post('/:id/assign', async (req, res) => {
  try {
    const { incidentId } = req.body;
    
    if (!incidentId) {
      return res.status(400).json({ message: 'Incident ID is required' });
    }
    
    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      { 
        currentMission: incidentId,
        status: 'active',
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedTeam) return res.status(404).json({ message: 'Team not found' });
    res.json(updatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Return team from mission
router.post('/:id/return', async (req, res) => {
  try {
    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      { 
        currentMission: null,
        status: 'standby',
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedTeam) return res.status(404).json({ message: 'Team not found' });
    res.json(updatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export const teamRoutes = router;