import express from 'express';
import mongoose from 'mongoose';
// Middleware
app.use(express.json());

// MongoDB Connection
const MONGO_URL ='mongodb://localhost:27017/disaster-management';

mongoose.connect(MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Disaster Management API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});