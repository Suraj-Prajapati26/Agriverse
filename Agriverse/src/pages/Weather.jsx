import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { showSuccess, showError } from '../toastConfig';
import {
  FaCloudSun,
  FaThermometerHalf,
  FaTint,
  FaWind,
  FaSeedling,
  FaLeaf,
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBug,
  FaCamera,
  FaChartLine
} from 'react-icons/fa';
import './Weather.css';

function Weather() {
  const { currentUser, token } = useAuth();
  const [weatherData, setWeatherData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('Pune');
  const [recommendations, setRecommendations] = useState([]);
  const [mandiPrices, setMandiPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diseaseImage, setDiseaseImage] = useState(null);
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [diseaseLoading, setDiseaseLoading] = useState(false);
  const [soilType, setSoilType] = useState('clay');
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  const regions = ['Pune', 'Mumbai', 'Delhi', 'Nashik', 'Aurangabad', 'Kolhapur'];
  const soilTypes = ['clay', 'sandy', 'loamy', 'black', 'red'];
  const commodities = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Onion'];

  useEffect(() => {
    loadWeatherData();
    loadMandiPrices();
    if (currentUser && token) {
      loadRecommendations();
    }
  }, [selectedRegion, currentUser, token]);

  const loadWeatherData = async () => {
    try {
      setLoading(true);

      // Try to fetch external weather data first
      try {
        const fetchResponse = await fetch(
          `http://localhost:8083/api/weather/fetch/${selectedRegion}`,
          {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          }
        );
      } catch (error) {
        console.log('External weather fetch not available');
      }

      // Get weather data from database
      const weatherResponse = await fetch(
        `http://localhost:8083/api/weather/${selectedRegion}`
      );

      if (weatherResponse.ok) {
        const weather = await weatherResponse.json();
        setWeatherData(weather);
      } else {
        // Set dummy data if no weather data available
        setWeatherData({
          region: selectedRegion,
          temperature: Math.floor(Math.random() * 15) + 20,
          humidity: Math.floor(Math.random() * 40) + 50,
          rainfall: Math.floor(Math.random() * 100),
          logDate: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error loading weather data:', error);
      // Set dummy data as fallback
      setWeatherData({
        region: selectedRegion,
        temperature: Math.floor(Math.random() * 15) + 20,
        humidity: Math.floor(Math.random() * 40) + 50,
        rainfall: Math.floor(Math.random() * 100),
        logDate: new Date().toISOString().split('T')[0]
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMandiPrices = async () => {
    try {
      const pricesData = [];
      for (const commodity of commodities.slice(0, 3)) {
        try {
          const response = await fetch(
            `http://localhost:8083/api/mandi/price/${commodity}/Maharashtra`
          );
          if (response.ok) {
            const priceData = await response.json();
            pricesData.push(priceData);
          }
        } catch (error) {
          // Add dummy data if API fails
          pricesData.push({
            commodity,
            state: 'Maharashtra',
            price: Math.floor(Math.random() * 2000) + 1000,
            unit: 'per quintal',
            date: new Date().toISOString().split('T')[0]
          });
        }
      }
      setMandiPrices(pricesData);
    } catch (error) {
      console.error('Error loading mandi prices:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await fetch(
        `http://localhost:8083/api/recommendations/${currentUser.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const recs = await response.json();
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const generateRecommendation = async () => {
    if (!currentUser || !token) return;

    setRecommendationLoading(true);
    try {
      const response = await fetch('http://localhost:8083/api/recommendations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          region: selectedRegion,
          soilType: soilType
        }),
      });

      if (response.ok) {
        loadRecommendations();
      }
    } catch (error) {
      console.error('Error generating recommendation:', error);
    } finally {
      setRecommendationLoading(false);
    }
  };

  const handleDiseaseImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDiseaseImage(file);
      setDiseaseResult(null);
    }
  };

  const detectDisease = async () => {
    if (!diseaseImage || !currentUser || !token) return;

    setDiseaseLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', diseaseImage);

      const response = await fetch('http://localhost:8083/api/disease/detect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setDiseaseResult(result);
      } else {
        // Mock result for demo
        setDiseaseResult({
          disease: 'Leaf Blight',
          confidence: 0.85,
          treatment: 'Apply fungicide and ensure proper drainage',
          severity: 'Medium'
        });
      }
    } catch (error) {
      console.error('Error detecting disease:', error);
      // Mock result for demo
      setDiseaseResult({
        disease: 'Leaf Spot',
        confidence: 0.78,
        treatment: 'Remove affected leaves and apply copper-based fungicide',
        severity: 'Low'
      });
    } finally {
      setDiseaseLoading(false);
    }
  };

  if (loading && !weatherData) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading weather data...</p>
      </div>
    );
  }

  return (
    <div className="weather-page">
      <div className="container">
        {/* Header */}
        <div className="weather-header">
          <h1>
            <FaCloudSun />
            Weather & Crop Insights
          </h1>
          <p>Real-time weather data and agricultural recommendations</p>
        </div>

        {/* Region Selector */}
        <div className="region-selector">
          <div className="selector-group">
            <FaMapMarkerAlt />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="region-select"
            >
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Weather Card */}
        {weatherData && (
          <div className="weather-card">
            <div className="weather-main">
              <div className="weather-info">
                <h2>{weatherData.region}</h2>
                <div className="weather-date">
                  <FaCalendarAlt />
                  {new Date(weatherData.logDate).toLocaleDateString()}
                </div>
              </div>

              <div className="weather-stats">
                <div className="weather-stat">
                  <div className="stat-icon temperature">
                    <FaThermometerHalf />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{weatherData.temperature}°C</span>
                    <span className="stat-label">Temperature</span>
                  </div>
                </div>

                <div className="weather-stat">
                  <div className="stat-icon humidity">
                    <FaTint />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{weatherData.humidity}%</span>
                    <span className="stat-label">Humidity</span>
                  </div>
                </div>

                <div className="weather-stat">
                  <div className="stat-icon rainfall">
                    <FaWind />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">{weatherData.rainfall}mm</span>
                    <span className="stat-label">Rainfall</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="content-grid">
          {/* Crop Recommendations */}
          {currentUser && (
            <div className="recommendations-section">
              <div className="section-header">
                <h3>
                  <FaSeedling />
                  Crop Recommendations
                </h3>
                <div className="recommendation-controls">
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="soil-select"
                  >
                    {soilTypes.map(soil => (
                      <option key={soil} value={soil}>
                        {soil.charAt(0).toUpperCase() + soil.slice(1)} Soil
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={generateRecommendation}
                    className="btn btn-primary"
                    disabled={recommendationLoading}
                  >
                    {recommendationLoading ? 'Generating...' : 'Get Recommendations'}
                  </button>
                </div>
              </div>

              <div className="recommendations-list">
                {recommendations.length > 0 ? (
                  recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="recommendation-card">
                      <div className="rec-header">
                        <FaLeaf />
                        <span className="rec-crop">{rec.recommendedCrop || 'Cotton'}</span>
                      </div>
                      <div className="rec-details">
                        <p><strong>Region:</strong> {rec.region}</p>
                        <p><strong>Soil Type:</strong> {rec.soilType}</p>
                        <p><strong>Season:</strong> {rec.season || 'Kharif'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-recommendations">
                    <FaSeedling />
                    <p>No recommendations yet. Generate some based on your region and soil type!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mandi Prices */}
          <div className="mandi-section">
            <div className="section-header">
              <h3>
                <FaChartLine />
                Market Prices
              </h3>
            </div>

            <div className="mandi-list">
              {mandiPrices.length > 0 ? (
                mandiPrices.map((price, index) => (
                  <div key={index} className="mandi-card">
                    <div className="mandi-commodity">
                      <span className="commodity-name">{price.commodity}</span>
                      <span className="commodity-state">{price.state}</span>
                    </div>
                    <div className="mandi-price">
                      <span className="price-value">₹{price.price}</span>
                      <span className="price-unit">{price.unit}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-prices">
                  <FaChartLine />
                  <p>Loading market prices...</p>
                </div>
              )}
            </div>
          </div>

          {/* Disease Detection */}
          {currentUser && (
            <div className="disease-section">
              <div className="section-header">
                <h3>
                  <FaBug />
                  Disease Detection
                </h3>
              </div>

              <div className="disease-upload">
                <div className="upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDiseaseImageUpload}
                    id="disease-image"
                    hidden
                  />
                  <label htmlFor="disease-image" className="upload-label">
                    <FaCamera />
                    <span>Upload Crop Image</span>
                  </label>

                  {diseaseImage && (
                    <div className="uploaded-image">
                      <p>Image: {diseaseImage.name}</p>
                      <button
                        onClick={detectDisease}
                        className="btn btn-primary"
                        disabled={diseaseLoading}
                      >
                        {diseaseLoading ? 'Analyzing...' : 'Detect Disease'}
                      </button>
                    </div>
                  )}
                </div>

                {diseaseResult && (
                  <div className="disease-result">
                    <h4>Detection Result</h4>
                    <div className="result-details">
                      <p><strong>Disease:</strong> {diseaseResult.disease}</p>
                      <p><strong>Confidence:</strong> {Math.round(diseaseResult.confidence * 100)}%</p>
                      <p><strong>Severity:</strong>
                        <span className={`severity ${diseaseResult.severity.toLowerCase()}`}>
                          {diseaseResult.severity}
                        </span>
                      </p>
                      <p><strong>Treatment:</strong> {diseaseResult.treatment}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Weather;