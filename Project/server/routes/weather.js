import express from 'express';

const router = express.Router();

// Mock weather data
const weatherData = {
  current: {
    temperature: 28,
    condition: 'Clear Sky',
    windSpeed: 15,
    windDirection: 'NW',
    humidity: 65,
    precipitation: 0,
    visibility: 10,
    pressure: 1012,
    uv: 5,
    lastUpdated: new Date()
  },
  forecast: [
    {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      highTemp: 30,
      lowTemp: 18,
      condition: 'Sunny',
      windSpeed: 12,
      precipitation: 0,
      humidity: 60
    },
    {
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      highTemp: 32,
      lowTemp: 20,
      condition: 'Partly Cloudy',
      windSpeed: 10,
      precipitation: 10,
      humidity: 65
    },
    {
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      highTemp: 29,
      lowTemp: 19,
      condition: 'Scattered Showers',
      windSpeed: 15,
      precipitation: 40,
      humidity: 75
    },
    {
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      highTemp: 25,
      lowTemp: 17,
      condition: 'Rain',
      windSpeed: 20,
      precipitation: 80,
      humidity: 85
    },
    {
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      highTemp: 23,
      lowTemp: 16,
      condition: 'Thunderstorms',
      windSpeed: 25,
      precipitation: 90,
      humidity: 90
    }
  ],
  alerts: [
    {
      type: 'heat',
      severity: 'moderate',
      title: 'Heat Advisory',
      description: 'Temperature expected to exceed 30°C for the next 3 days.',
      start: new Date(),
      end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    }
  ]
};

// Get current weather
router.get('/current', (req, res) => {
  res.json(weatherData.current);
});

// Get weather forecast
router.get('/forecast', (req, res) => {
  res.json(weatherData.forecast);
});

// Get weather alerts
router.get('/alerts', (req, res) => {
  res.json(weatherData.alerts);
});

// Get all weather data
router.get('/', (req, res) => {
  res.json(weatherData);
});

export const weatherRoutes = router;