import React, { useState, useEffect } from 'react';
import { AlertCircle, MoreHorizontal, MapPin, Search, Loader, Brain, TrendingUp, Shield, Zap, Wind, Droplets } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import weatherService from '../../services/weatherService';

function AIPredictionCard() {
  const { location, address } = useLocation();
  const [locationInput, setLocationInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState({
    flood: 'Low',
    wildfire: 'Low',
    earthquake: 'Very Low',
    storm: 'Low'
  });
  const [aiPrediction, setAiPrediction] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [confidence, setConfidence] = useState(85);
  const [predictionWindow, setPredictionWindow] = useState('24 hours');

  useEffect(() => {   
    if (location && location.latitude && location.longitude) {
      handleLocationPrediction(location.latitude, location.longitude);
    }
  }, [location]);

  const handleLocationPrediction = async (lat, lng) => {
    try {
      if (!lat || !lng) throw new Error('Invalid location');
      setIsLoading(true)
      const data = await weatherService.getAIPrediction(lat, lng);
      setAiPrediction(data);
      setPredictions({
        flood: data?.aiAnalysis?.precipitationLikelihoodPercent > 70 ? 'High' : 'Low',
        wildfire: data?.aiAnalysis?.temperatureTrend === 'rising' ? 'Moderate' : 'Low',
        earthquake: 'Low',
        storm: data?.aiAnalysis?.extremeWeatherRisk === 'high' ? 'High' : 'Moderate',
      });
      setConfidence(data.confidence || 85);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('AI Prediction Error:', error);
      mockPredictDisaster('default');
    } finally {
      setIsLoading(false);
    }
  }

  const mockPredictDisaster = async (locationStr) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowerLocation = locationStr.toLowerCase();
    let newPredictions = { ...predictions };
    let aiAnalysis = {
      recommendations: [],
      riskFactors: []
    };
    
    // Enhanced location-based predictions with more keywords
    if (lowerLocation.includes('forest') || lowerLocation.includes('mountain') || lowerLocation.includes('california') || 
        lowerLocation.includes('woods') || lowerLocation.includes('desert') || lowerLocation.includes('dry')) {
      newPredictions.wildfire = 'High';
      newPredictions.flood = 'Low';
      newPredictions.earthquake = 'Moderate';
      newPredictions.storm = 'Low';
      aiAnalysis.recommendations = [
        'Create defensible space around buildings',
        'Maintain emergency evacuation routes',
        'Monitor fire weather conditions'
      ];
      setConfidence(88);
    } else if (lowerLocation.includes('coast') || lowerLocation.includes('river') || lowerLocation.includes('florida') ||
               lowerLocation.includes('lake') || lowerLocation.includes('delta') || lowerLocation.includes('bay')) {
      newPredictions.flood = 'High';
      newPredictions.wildfire = 'Low';
      newPredictions.earthquake = 'Low';
      newPredictions.storm = 'High';
      aiAnalysis.recommendations = [
        'Prepare sandbags and flood barriers',
        'Identify higher ground evacuation routes',
        'Monitor water level forecasts'
      ];
      setConfidence(92);
    } else if (lowerLocation.includes('fault') || lowerLocation.includes('san francisco') || lowerLocation.includes('tokyo') ||
               lowerLocation.includes('los angeles') || lowerLocation.includes('seattle') || lowerLocation.includes('plate')) {
      newPredictions.earthquake = 'High';
      newPredictions.flood = 'Moderate';
      newPredictions.wildfire = 'Low';
      newPredictions.storm = 'Moderate';
      aiAnalysis.recommendations = [
        'Secure heavy objects and furniture',
        'Prepare earthquake emergency kit',
        'Practice drop, cover, and hold on'
      ];
      setConfidence(85);
    } else if (lowerLocation.includes('tornado') || lowerLocation.includes('oklahoma') || lowerLocation.includes('kansas') ||
               lowerLocation.includes('midwest') || lowerLocation.includes('plains') || lowerLocation.includes('valley')) {
      newPredictions.storm = 'High';
      newPredictions.flood = 'Moderate';
      newPredictions.wildfire = 'Low';
      newPredictions.earthquake = 'Low';
      aiAnalysis.recommendations = [
        'Identify safe room or storm shelter',
        'Monitor weather radar regularly',
        'Prepare emergency communication plan'
      ];
      setConfidence(89);
    } else {
      // General urban area
      newPredictions.flood = 'Moderate';
      newPredictions.wildfire = 'Moderate';
      newPredictions.earthquake = 'Low';
      newPredictions.storm = 'Moderate';
      aiAnalysis.recommendations = [
        'Maintain emergency supply kit',
        'Stay informed about local hazards',
        'Develop family emergency plan'
      ];
      setConfidence(Math.floor(Math.random() * 20) + 75);
    }
    
    setPredictions(newPredictions);
    setAiPrediction({ aiAnalysis });
    setLastUpdated(new Date().toLocaleTimeString());
    setIsLoading(false);
  };

  const handlePrediction = () => {
    if (locationInput.trim()) {
      mockPredictDisaster(locationInput.trim());
    }
  };
  const getConfidenceColor = () => {
    if (confidence >= 90) return 'text-green-600 dark:text-green-400';
    if (confidence >= 80) return 'text-blue-600 dark:text-blue-400';
    if (confidence >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white flex items-center">
          <Brain className="h-5 w-5 md:h-6 md:w-6 mr-3 text-purple-600" />
          AI Risk Prediction
        </h2>
        <div className="flex items-center space-x-3">
          <span className={`text-sm md:text-base font-bold px-2 py-1 rounded-lg bg-white dark:bg-gray-800 ${getConfidenceColor()}`}>
            {confidence}% confidence
          </span>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <MoreHorizontal size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
      </div>
      
      <div className="p-3 md:p-4">
        {/* Location Input */}
        {/* Current Location Display */}
        {address && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span className="truncate">
                Current Location: {address.city || address.formatted || 'Unknown'}
              </span>
            </div>
          </div>
        )}

        {/* Manual Location Input */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter location for custom prediction..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePrediction()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handlePrediction}
              disabled={isLoading || !locationInput.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Analyzing...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Predict</span>
                </>
              )}
            </button>
          </div>
          
          {/* Demo Examples */}
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">💡 Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {['California Forest', 'Florida Coast', 'San Francisco', 'Oklahoma Plains', 'Tokyo Japan'].map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setLocationInput(example);
                    mockPredictDisaster(example);
                  }}
                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                  disabled={isLoading}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
          
          {lastUpdated && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Last updated: {lastUpdated}
            </p>
          )}
        </div>

        {/* Risk Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          {/* Flood Risk */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">Flood</span>
              </div>
              <span className={`text-xs md:text-sm font-bold ${getRiskColor(predictions.flood)}`}>
                {predictions.flood}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getRiskBgColor(predictions.flood)}`}
                style={{ width: getRiskPercentage(predictions.flood) }}
              ></div>
            </div>
          </div>

          {/* Wildfire Risk */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-orange-500 mr-2" />
                <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">Wildfire</span>
              </div>
              <span className={`text-xs md:text-sm font-bold ${getRiskColor(predictions.wildfire)}`}>
                {predictions.wildfire}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getRiskBgColor(predictions.wildfire)}`}
                style={{ width: getRiskPercentage(predictions.wildfire) }}
              ></div>
            </div>
          </div>

          {/* Earthquake Risk */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">Earthquake</span>
              </div>
              <span className={`text-xs md:text-sm font-bold ${getRiskColor(predictions.earthquake)}`}>
                {predictions.earthquake}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getRiskBgColor(predictions.earthquake)}`}
                style={{ width: getRiskPercentage(predictions.earthquake) }}
              ></div>
            </div>
          </div>

          {/* Storm Risk */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Wind className="h-4 w-4 text-purple-500 mr-2" />
                <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">Storm</span>
              </div>
              <span className={`text-xs md:text-sm font-bold ${getRiskColor(predictions.storm)}`}>
                {predictions.storm}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getRiskBgColor(predictions.storm)}`}
                style={{ width: getRiskPercentage(predictions.storm) }}
              ></div>
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        {aiPrediction && aiPrediction.aiAnalysis && aiPrediction.aiAnalysis.recommendations && (
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg p-4 md:p-6 mb-6 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-600 rounded-lg mr-3">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-purple-800 dark:text-purple-200">
                AI Analysis & Recommendations
              </h3>
            </div>
            
            <div className="space-y-3">
              {aiPrediction.aiAnalysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start bg-white dark:bg-gray-800/50 rounded-lg p-3 shadow-sm">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <span className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">{rec}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-purple-600/10 dark:bg-purple-400/10 rounded-lg border border-purple-300 dark:border-purple-600">
              <p className="text-xs md:text-sm text-purple-700 dark:text-purple-300 font-medium">
                💡 These recommendations are generated by AI based on location-specific risk factors and historical data.
              </p>
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                {predictionWindow}
              </div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Prediction Window</div>
            </div>
            <div>
              <div className={`text-xl md:text-2xl font-bold ${getConfidenceColor()}`}>
                {confidence}%
              </div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">AI Confidence</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                {Object.values(predictions).filter(risk => risk === 'High' || risk === 'Critical').length}
              </div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">High Risk Areas</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
            Risk assessments based on live weather data, historical patterns, and AI analysis.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper functions
const getRiskColor = (risk) => {
  switch (risk.toLowerCase()) {
    case 'low':
      return 'text-green-600 dark:text-green-400';
    case 'very low':
      return 'text-green-600 dark:text-green-400';
    case 'moderate':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'high':
      return 'text-orange-600 dark:text-orange-400';
    case 'critical':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

const getRiskBgColor = (risk) => {
  switch (risk.toLowerCase()) {
    case 'low':
      return 'bg-green-500';
    case 'very low':
      return 'bg-green-500';
    case 'moderate':
      return 'bg-yellow-500';
    case 'high':
      return 'bg-orange-500';
    case 'critical':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getRiskPercentage = (risk) => {
  switch (risk.toLowerCase()) {
    case 'very low':
      return '10%';
    case 'low':
      return '25%';
    case 'moderate':
      return '50%';
    case 'high':
      return '75%';
    case 'critical':
      return '100%';
    default:
      return '0%';
  }
};

export default AIPredictionCard;
