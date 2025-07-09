import React, { useState, useEffect } from 'react';
import { CloudSun, MoreHorizontal, Droplets, Wind, Eye, MapPin, Search, Brain, RefreshCw, TrendingUp, TrendingDown, Minus, Thermometer, Gauge, Sun } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import weatherService from '../../services/weatherService';

function WeatherCard() {
  const { location, weather: contextWeather, isLoading: locationLoading } = useLocation();
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Load weather data when location changes
  useEffect(() => {
    const loadWeatherData = async () => {
      if (!location?.latitude || !location?.longitude) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Load current weather
        const currentWeather = await weatherService.getCurrentWeather(
          location.latitude,
          location.longitude
        );
        setWeather(currentWeather);

        // Load forecast
        const forecastData = await weatherService.getWeatherForecast(
          location.latitude,
          location.longitude,
          5
        );
        setForecast(forecastData);

        // Load AI prediction
        const aiData = await weatherService.getAIPrediction(
          location.latitude,
          location.longitude
        );
        setAiPrediction(aiData);

        setLastUpdated(new Date());
      } catch (err) {
        setError(err.message);
        console.error('Failed to load weather data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!locationLoading) {
      loadWeatherData();
    }
  }, [location, locationLoading]);

  // Use context weather as fallback
  useEffect(() => {
    if (contextWeather && !weather) {
      setWeather(contextWeather);
    }
  }, [contextWeather, weather]);

  const handleRefresh = async () => {
    if (!location?.latitude || !location?.longitude || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const currentWeather = await weatherService.getCurrentWeather(
        location.latitude,
        location.longitude
      );
      setWeather(currentWeather);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getWeatherIcon = (condition) => {
    if (condition?.toLowerCase().includes('sun') || condition?.toLowerCase().includes('clear')) {
      return <Sun className="h-8 w-8 md:h-12 md:w-12 text-yellow-500" />;
    }
    if (condition?.toLowerCase().includes('cloud')) {
      return <CloudSun className="h-8 w-8 md:h-12 md:w-12 text-gray-500" />;
    }
    if (condition?.toLowerCase().includes('rain')) {
      return <Droplets className="h-8 w-8 md:h-12 md:w-12 text-blue-500" />;
    }
    return <CloudSun className="h-8 w-8 md:h-12 md:w-12 text-blue-500" />;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'rising') return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (trend === 'falling') return <TrendingDown className="h-4 w-4 text-blue-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  if (isLoading && !weather) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 md:p-6">
          <div className="animate-pulse">
            <div className="flex items-center mb-4">
              <div className="h-5 w-5 bg-gray-300 rounded mr-2"></div>
              <div className="h-6 bg-gray-300 rounded w-32"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="h-16 w-20 bg-gray-300 rounded mx-auto mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-16 mx-auto"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayWeather = weather || {
    temperature: 20,
    condition: 'Loading...',
    humidity: 0,
    windSpeed: 0,
    visibility: 0,
    pressure: 0
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          <CloudSun className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-600" />
          Live Weather
        </h2>
        <div className="flex items-center space-x-2">
          {location && (
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              title="Refresh weather data"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <MoreHorizontal size={18} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>
      
      {/* Weather Content */}
      <div className="p-3 md:p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">Error: {error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Current Weather */}
          <div className="flex items-center justify-center p-3 md:p-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                {getWeatherIcon(displayWeather.condition)}
              </div>
              <div className="flex items-center justify-center mb-2">
                <span className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-white">
                  {displayWeather.temperature}°C
                </span>
                {aiPrediction?.aiAnalysis?.temperatureTrend && (
                  <div className="ml-2">
                    {getTrendIcon(aiPrediction.aiAnalysis.temperatureTrend)}
                  </div>
                )}
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 capitalize">
                {displayWeather.condition}
              </div>
              {displayWeather.feelsLike && (
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Feels like {displayWeather.feelsLike}°C
                </div>
              )}
              {displayWeather.location && (
                <div className="flex items-center justify-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3 w-3 mr-1" />
                  {displayWeather.location}
                </div>
              )}
            </div>
          </div>
          
          {/* Weather Details */}
          <div className="p-3 md:p-4">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <Droplets className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Humidity</div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">
                    {displayWeather.humidity}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <Wind className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Wind</div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">
                    {displayWeather.windSpeed} km/h
                  </div>
                </div>
              </div>
              
              <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <Eye className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Visibility</div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">
                    {displayWeather.visibility} km
                  </div>
                </div>
              </div>
              
              {displayWeather.pressure && (
                <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <Gauge className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Pressure</div>
                    <div className="text-sm font-medium text-gray-800 dark:text-white">
                      {displayWeather.pressure} hPa
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* AI Prediction Section */}
        {aiPrediction && (
          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center mb-3">
              <Brain className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2" />
              <h3 className="text-sm md:text-base font-semibold text-blue-800 dark:text-blue-200">
                AI Weather Analysis
              </h3>
              <span className="ml-auto text-xs text-blue-600 dark:text-blue-400">
                {aiPrediction.confidence}% confidence
              </span>
            </div>
            
            {aiPrediction.aiAnalysis?.recommendations && aiPrediction.aiAnalysis.recommendations.length > 0 && (
              <div className="space-y-2">
                {aiPrediction.aiAnalysis.recommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} className="flex items-start text-xs md:text-sm text-blue-700 dark:text-blue-300">
                    <span className="mr-2">•</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
            
            {aiPrediction.aiAnalysis?.precipitationLikelihood && (
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                Precipitation chance: {aiPrediction.aiAnalysis.precipitationLikelihood}%
              </div>
            )}
          </div>
        )}
        
        {/* 5-Day Forecast */}
        {forecast && forecast.length > 0 && (
          <div className="mt-4 md:mt-6">
            <h3 className="text-sm md:text-base font-semibold text-gray-800 dark:text-white mb-3">
              5-Day Forecast
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
              {forecast.slice(0, 5).map((day, index) => (
                <div key={index} className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                  <div className="text-xs md:text-sm font-medium text-gray-800 dark:text-white">
                    {day.maxTemp}° / {day.minTemp}°
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                    {day.condition}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-3 md:px-4 pb-3 md:pb-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded flex justify-between items-center">
          <span>
            <strong>Data Source:</strong> {weather ? 'OpenWeatherMap API' : 'Mock Data'}
          </span>
          {lastUpdated && (
            <span>
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;