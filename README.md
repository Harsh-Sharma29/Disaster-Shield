## TEAM ResQTech 
## DisasterShield - Integrating Edge AI for Autonomous Disaster Resilience and Rapid Response.


## Project Video Link
https://drive.google.com/drive/folders/1RqtDxxg3SyRG0rROvd26ptO_N1OwciAF?usp=sharing

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

### 📊 **Decision Support System**
- **Risk Assessment**: Manual and data-driven threat level evaluation
- **Historical Analysis**: Pattern recognition from past incidents
- **Resource Planning**: Strategic resource allocation recommendations
- **Response Coordination**: Systematic scenario planning and preparation
- **Performance Tracking**: Continuous improvement from operational data

### 📊 **Comprehensive Analytics**
- **Performance Dashboards**: Real-time KPI monitoring
- **Response Analysis**: Detailed incident response evaluation
- **Trend Identification**: Long-term pattern recognition
- **Efficiency Metrics**: Resource utilization optimization
- **Custom Reporting**: Tailored analytics for specific needs

## 🛠️ Technology Stack

### **Frontend Architecture**
```
🎨 User Interface
├── React 18.3.1           → Modern UI framework with hooks
├── Vite 5.4.19            → Lightning-fast build tool
├── Tailwind CSS 3.4.17    → Utility-first styling
├── Framer Motion 10.18     → Smooth animations
├── React Router 6.30       → Client-side routing
├── Lucide React 0.344     → Beautiful icon library
└── Recharts 2.15          → Data visualization
```

### **Backend Infrastructure**
```
⚡ Server Architecture
├── Node.js 18+            → Runtime environment
├── Express.js 4.21        → Web application framework
├── MongoDB 8.14           → Document database
├── MySQL 3.14             → Relational database
├── Mongoose 8.14          → MongoDB object modeling
└── Socket.io              → Real-time communication
```

### **Development Tools**
```
🔧 Developer Experience
├── ESLint 9.12            → Code quality enforcement
├── Prettier               → Code formatting
├── Nodemon 3.1            → Development auto-reload
├── Concurrently 8.2       → Multi-process management
└── Vite Dev Server        → Hot module replacement
```

## 📁 Project Architecture

```
disaster-shield/
├── 📂 src/                          # Frontend source code
│   ├── 📂 components/              # Reusable UI components
│   │   ├── 📂 Dashboard/           # Dashboard-specific components
│   │   │   ├── AIPredictionCard.jsx
│   │   │   ├── WeatherCard.jsx
│   │   │   ├── AlertsCard.jsx
│   │   │   └── MapCard.jsx
│   │   ├── 📂 Layout/              # Layout components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Layout.jsx
│   │   └── 📂 Modals/              # Modal dialogs
│   │       ├── LoginModal.jsx
│   │       ├── ReportIncidentModal.jsx
│   │       └── EmergencyResponseModal.jsx
│   ├── 📂 pages/                   # Page components
│   │   ├── Dashboard.jsx           # Main dashboard
│   │   ├── AlertsWarnings.jsx      # Alert management
│   │   ├── Resources.jsx           # Resource tracking
│   │   ├── MapView.jsx             # Geographic view
│   │   ├── EmergencyTeams.jsx      # Team coordination
│   │   └── Settings.jsx            # System configuration
│   ├── 📂 contexts/                # React contexts
│   │   └── ThemeContext.jsx        # Theme management
│   ├── 📂 services/                # API services
│   │   └── api.js                  # API communication
│   ├── 📂 data/                    # Demo data and utilities
│   │   └── demoData.js             # Mock data for development
│   └── 📂 utils/                   # Utility functions
├── 📂 server/                       # Backend source code
│   ├── 📂 routes/                  # API endpoints
│   │   ├── alerts.js               # Alert management API
│   │   ├── teams.js                # Team coordination API
│   │   ├── resources.js            # Resource management API
│   │   ├── incidents.js            # Incident tracking API
│   │   └── weather.js              # Weather data API
│   ├── 📂 models/                  # Database models
│   │   └── Alert.js                # Alert data model
│   ├── 📂 middleware/              # Custom middleware
│   └── 📂 utils/                   # Server utilities
├── 📂 public/                       # Static assets
├── 📂 docs/                         # Documentation
└── 📄 Configuration Files
    ├── package.json                # Dependencies and scripts
    ├── vite.config.js              # Vite configuration
    ├── tailwind.config.js          # Tailwind CSS configuration
    ├── eslint.config.js            # ESLint rules
    └── .env                        # Environment variables
```

## 🚀 Quick Start Guide

### **📋 Prerequisites**
```bash
✅ Node.js 18+ (Download from nodejs.org)
✅ npm 9+ or yarn 1.22+ (Package manager)
✅ Git (Version control)
✅ MongoDB 6+ (Database - local or cloud)
✅ Modern web browser (Chrome, Firefox, Safari, Edge)
```

### **⚡ Installation Steps**

#### **1. Clone and Setup**
```bash
# Clone the repository
git clone https://github.com/your-username/disaster-shield.git
cd disaster-shield

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

#### **2. Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit configuration (use your preferred editor)
nano .env
# or
code .env
```

#### **3. Database Setup**
```bash
# For MongoDB (if running locally)
mongod --dbpath ./data/db

# For cloud MongoDB, update MONGO_URI in .env
# Example: mongodb+srv://username:password@cluster.mongodb.net/disaster-shield
```

#### **4. Launch Application**
```bash
# Start both frontend and backend (recommended)
npm run dev:all

# OR start services separately
npm run dev      # Frontend only (port 3000)
npm run server   # Backend only (port 5000)
```

#### **5. Access Your Dashboard**
```
🌐 Frontend Application: http://localhost:3000
🔧 Backend API Server:   http://localhost:5000
📊 API Documentation:    http://localhost:5000/api/docs
```

### **🎯 First Time Setup**

1. **Open your browser** to `http://localhost:3000`
2. **Wait for the loading screen** (initializes demo data)
3. **Explore the dashboard** with pre-loaded demo data
4. **Click through different sections** to see all features
5. **Check the sidebar navigation** for all available pages

## ⚙️ Configuration Guide

### **🔐 Environment Variables**

Create your `.env` file with the following configuration:

# 🍃 MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/disaster-management

# 🌐 External API Keys (replace with your actual keys)
WEATHER_API_KEY=your_openweather_api_key_here
MAPBOX_API_KEY=your_mapbox_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# 🔒 Security Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters
SESSION_SECRET=your_session_secret_key

# 📧 Email Notifications (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# 📱 SMS Notifications (optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### **🔑 API Service Setup**

#### **Weather Service (OpenWeatherMap)**
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Generate an API key
4. Add to your `.env` file

#### **Mapping Service (Mapbox)**
1. Visit [Mapbox](https://www.mapbox.com/)
2. Create a free account
3. Generate an access token
4. Add to your `.env` file

## 📖 Usage Guide

### **🎛️ Dashboard Overview**
The main dashboard provides a comprehensive view of your emergency management system:

- **📊 Key Metrics**: Active alerts, deployed teams, response times
- **🗺️ Interactive Map**: Real-time incident and asset visualization
- **🌤️ Weather Conditions**: Current weather and forecasts
- **🤖 AI Predictions**: Risk assessments and recommendations
- **📈 Live Updates**: Real-time data feeds and notifications

### **🚨 Alert Management**
**Create and manage emergency alerts:**

1. **Navigate to Alerts & Warnings**
2. **Click "Create Alert"** to add a new alert
3. **Configure severity levels** (Low, Moderate, High, Critical)
4. **Set geographic boundaries** for affected areas
5. **Assign response teams** and resources
6. **Track resolution progress** through the alert lifecycle

### **👥 Team Coordination**
**Manage emergency response teams:**

1. **Access Emergency Teams** section
2. **View team status** (Available, Deployed, Training)
3. **Assign teams to incidents** with drag-and-drop
4. **Monitor real-time locations** via GPS tracking
5. **Coordinate communications** through integrated messaging

### **📦 Resource Management**
**Track and allocate emergency resources:**

1. **Open Resources** page
2. **Monitor inventory levels** across categories
3. **Set automatic reorder points** for critical supplies
4. **Allocate resources** to active incidents
5. **Generate utilization reports** for planning

## 🔧 Development Guide

### **📝 Code Standards**
```bash
# Check code quality
npm run lint

# Fix automatic issues
npm run lint:fix

# Format code
npm run format

# Type checking (if using TypeScript)
npm run type-check
```

### **🧪 Testing**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

### **🏗️ Building for Production**
```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview

# Analyze bundle size
npm run analyze
```


### **☁️ Cloud Deployment**

#### **Vercel (Frontend)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 🔒 Security Features

- **🛡️ Authentication**: JWT-based secure login system
- **🔐 Authorization**: Role-based access control (RBAC)
- **🚫 Input Validation**: Comprehensive data sanitization
- **🔒 HTTPS Encryption**: Secure data transmission
- **🔍 Audit Logging**: Complete action tracking
- **🛡️ XSS Protection**: Cross-site scripting prevention
- **🚨 Rate Limiting**: API abuse prevention


### **📋 Development Guidelines**

- **Write comprehensive tests** for all new features
- **Follow existing code style** and patterns
- **Update documentation** for any API changes
- **Add meaningful comments** for complex logic
- **Test across different browsers** and devices
- **Consider accessibility** in UI design

## 🗺️ Roadmap

### **📅 Phase 1: Foundation (Current - Q1 2025)**
- ✅ Core dashboard functionality
- ✅ Basic alert management
- ✅ Team coordination features
- ✅ Resource tracking system
- ✅ Responsive design

### **🚀 Phase 2: Enhancement **
- 🔄 Advanced mapping features
- 🔄 Mobile application development
- 🔄 Enhanced analytics dashboard
- 🔄 Machine learning integration
- 🔄 Multi-language support

### **🌟 Phase 3: Advanced Features**
- 📋 Advanced predictive modeling
- 📋 Multi-agency coordination platform
- 📋 International compliance standards
- 📋 Offline capability

### **🚀 Future Innovations**
- 🔮 Augmented Reality (AR) field support
- 🔮 Drone integration and control
- 🔮 Satellite imagery analysis
- 🔮 Blockchain-based secure communications
- 🔮 Advanced AI decision support

## 📞 Support & Community

### **🆘 Getting Help**
- **📧 Email Support**: support@disastershield.com
- **💬 Community Discord**: [Join our community](https://discord.gg/disastershield)
- **📞 Emergency Hotline**: +1 (555) DISASTER (1-555-347-2783)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/your-username/disaster-shield/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/your-username/disaster-shield/discussions)

### **📚 Documentation**
- **📖 API Documentation**: [docs.disastershield.com](https://docs.disastershield.com)
- **🎥 Video Tutorials**: [YouTube Channel](https://youtube.com/disastershield)
- **📝 Blog**: [blog.disastershield.com](https://blog.disastershield.com)
- **🎓 Training Materials**: Available upon request

### **🌍 Community Resources**
- **💼 Professional Network**: Connect with emergency management professionals
- **🏆 Best Practices**: Share and learn from real-world implementations
- **🔄 Regular Updates**: Monthly community calls and updates
- **🎯 User Groups**: Regional user groups and meetups

### **Commercial Use**
DisasterShield is free for:
- ✅ Emergency response organizations
- ✅ Educational institutions
- ✅ Non-profit disaster relief organizations
- ✅ Government agencies
- ✅ Research institutions

### Built With**
This project stands on the shoulders of giants:
- React Team for the amazing framework
- Tailwind CSS for the utility-first approach
- Vite team for the lightning-fast development experience
- MongoDB and MySQL teams for robust database solutions
- All open source contributors who make projects like this possible


