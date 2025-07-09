## TEAM ResQTech 
## DisasterShield - Integrating Edge AI for Autonomous Disaster Resilience and Rapid Response.

## Project Overview

DisasterShield is an AI-powered, decentralized disaster management system that leverages Edge AI, and Blockchain to predict, alert, help and coordinate emergency responses autonomously. Our solution ensures faster disaster detection, real-time communication, and optimized resource allocation, minimizing damage and casualties.

🔹 Edge AI enable real-time disaster prediction using sensors, satellite data, and machine learning for proactive response.

🔹 AI-driven resource management optimizes the allocation of rescue teams, medical aid, and relief supplies.

🔹 A Web platform provides emergency protocols, evacuation plans, and AI-powered training for public safety.

 ## Key Features
- Real-time alerts and notifications
- Live location and weather integration
- AI-powered disaster risk prediction
- Resource and team management
- Interactive map and analytics
- Responsive, modern UI

## Technology Stack
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, React Router, Recharts
- **Backend:** Node.js, Express, MongoDB, MySQL, Mongoose, Socket.io
- **Dev Tools:** ESLint, Prettier, Nodemon, Concurrently

## Project Structure

Project/
├── src/           # Frontend code
├── server/        # Backend code
├── public/        # Static assets
├── package.json   # Project config
└── 
## Routing & Navigation
- Main routes: `/dashboard`, `/alerts`, `/resources`, `/map`, `/teams`, `/settings`
- Dynamic routes: `/alerts/:alertId`, `/resources/:resourceId`, etc.
- Features: Breadcrumbs, sidebar, quick nav (Ctrl+K), 404 page

## Authentication & Demo Mode
- JWT-based login (see `src/contexts/AuthContext.jsx`)
- Demo accounts: admin, coordinator, responder, citizen
- Fallback to demo mode if API is unavailable

## AI Prediction System
- AI-powered risk assessment (see `src/components/Dashboard/AIPredictionCard.jsx`)
- Supports flood, wildfire, earthquake, storm predictions
- Location-based, with confidence scores and recommendations

## Live Location & Map
- Real-time user location (see `src/components/Map/LiveLocationMap.jsx`)
- Interactive map with risk zones, facilities, and team/resource tracking

## Weather Integration
- Live weather from OpenWeatherMap (see `src/services/weatherService.js`)
- 5-day forecast, icons, and location-based data

## Alerts, Resources, Teams Management
- Alerts: `src/pages/AlertsWarnings.jsx`, backend `server/routes/alerts.js`
- Resources: `src/pages/Resources.jsx`, backend `server/routes/resources.js`
- Teams: `src/pages/EmergencyTeams.jsx`, backend `server/routes/teams.js`
