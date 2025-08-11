import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaStore, 
  FaCloudSun, 
  FaBrain, 
  FaSeedling, 
  FaTractor, 
  FaChartLine,
  FaBell,
  FaLeaf,
  FaUsers,
  FaShoppingCart
} from 'react-icons/fa';
import { showError } from '../toastConfig';
import './Home.css';


function Home() {
  const { currentUser, token } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    notifications: 0
  });
  const [weatherData, setWeatherData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Features array must be inside the function
  const features = [
    {
      icon: <FaStore />,
      title: 'Marketplace',
      description: 'Buy and sell agricultural products and supplies',
      link: '/marketplace',
      color: '#3b82f6'
    },
    {
      icon: <FaCloudSun />,
      title: 'Weather & Crops',
      description: 'Get weather updates and crop recommendations for your region',
      link: '/weather',
      color: '#f59e0b'
    },
    {
      icon: <FaBrain />,
      title: 'Yield Prediction',
      description: 'AI-powered crop yield predictions to optimize your farming',
      link: '/prediction',
      color: '#8b5cf6'
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, [currentUser, token]);

  const loadDashboardData = async () => {
    try {
      // Load products count
      const productsResponse = await fetch('http://localhost:8082/api/products');
      if (productsResponse.ok) {
        const products = await productsResponse.json();
        setStats(prev => ({ ...prev, totalProducts: products.length }));
      } else {
        showError('Failed to load products');
      }

      if (currentUser && token) {
        // Load user orders
    const ordersResponse = await fetch(`http://localhost:8082/api/orders/user/${currentUser.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (ordersResponse.ok) {
          const orders = await ordersResponse.json();
          setStats(prev => ({ ...prev, totalOrders: orders.length }));
        } else {
          showError('Failed to load orders');
        }

        // Load notifications
        const notificationsResponse = await fetch('http://localhost:8081/api/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (notificationsResponse.ok) {
          const userNotifications = await notificationsResponse.json();
          setNotifications(userNotifications.slice(0, 5));
          setStats(prev => ({ ...prev, notifications: userNotifications.length }));
        } else {
          showError('Failed to load notifications');
        }
      }

      // Load weather data for default region
      try {
        const weatherResponse = await fetch('http://localhost:8083/api/weather/Pune');
        if (weatherResponse.ok) {
          const weather = await weatherResponse.json();
          setWeatherData(weather);
        }
      } catch (error) {
        // Weather data not available
      }

    } catch (error) {
      showError('Error loading dashboard data');
      console.error('Error loading dashboard data:', error);
    } finally {
      // End of loadDashboardData
    }
  }

  // if (loading) {
  //   return (
  //     <div className="loading">
  //       <div className="spinner"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Welcome to <span className="highlight">FarmTech</span>
                <FaSeedling className="hero-icon" />
              </h1>
              <p className="hero-description">
                Empowering farmers with technology. Access marketplace, weather data, 
                crop recommendations, and AI-powered predictions all in one place.
              </p>
              {!currentUser && (
                <div className="hero-actions">
                  <Link to="/signup" className="btn btn-primary">
                    Get Started <FaTractor />
                  </Link>
                  <Link to="/signin" className="btn btn-secondary">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
            <div className="hero-image">
              <div className="hero-card">
                <FaLeaf className="hero-card-icon" />
                <h3>Smart Farming</h3>
                <p>Technology meets agriculture</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {currentUser && (
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <FaShoppingCart />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalOrders}</h3>
                  <p>My Orders</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <FaStore />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalProducts}</h3>
                  <p>Products Available</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <FaBell />
                </div>
                <div className="stat-info">
                  <h3>{stats.notifications}</h3>
                  <p>Notifications</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Services</h2>
            <p>Comprehensive tools for modern farming</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <Link to={feature.link} key={index} className="feature-card">
                <div className="feature-icon" style={{ color: feature.color }}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Weather Widget */}
      {weatherData && (
        <section className="weather-widget">
          <div className="container">
            <div className="weather-card">
              <div className="weather-header">
                <FaCloudSun />
                <h3>Current Weather - {weatherData.region}</h3>
              </div>
              <div className="weather-info">
                <div className="weather-item">
                  <span>Temperature</span>
                  <span>{weatherData.temperature}°C</span>
                </div>
                <div className="weather-item">
                  <span>Humidity</span>
                  <span>{weatherData.humidity}%</span>
                </div>
                <div className="weather-item">
                  <span>Rainfall</span>
                  <span>{weatherData.rainfall}mm</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Notifications */}
      {currentUser && notifications.length > 0 && (
        <section className="notifications-section">
          <div className="container">
            <div className="section-header">
              <h3>Recent Notifications</h3>
              <Link to="/profile" className="view-all">View All</Link>
            </div>
            <div className="notifications-list">
              {notifications.map((notification, index) => (
                <div key={index} className="notification-item">
                  <div className="notification-icon">
                    <FaBell />
                  </div>
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-type">{notification.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;