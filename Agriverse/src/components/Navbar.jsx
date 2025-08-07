import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, 
  FaStore, 
  FaCloudSun, 
  FaBrain, 
  FaUser, 
  FaSignInAlt, 
  FaUserPlus, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaSeedling,
  FaBell
} from 'react-icons/fa';
import './Navbar.css';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <FaSeedling className="brand-icon" />
          <span>AgriVerse</span>
        </Link>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="navbar-nav">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <FaHome />
              <span>Home</span>
            </Link>
            
            <Link 
              to="/marketplace" 
              className={`nav-link ${isActive('/marketplace') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <FaStore />
              <span>Marketplace</span>
            </Link>
            
            <Link 
              to="/weather" 
              className={`nav-link ${isActive('/weather') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <FaCloudSun />
              <span>Weather</span>
            </Link>
            
            <Link 
              to="/prediction" 
              className={`nav-link ${isActive('/prediction') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <FaBrain />
              <span>Prediction</span>
            </Link>
          </div>

          <div className="navbar-auth">
            {currentUser ? (
              <>
                <Link 
                  to="/notifications" 
                  className={`nav-link ${isActive('/notifications') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <FaBell />
                  <span>Notifications</span>
                </Link>
                <Link 
                  to="/profile" 
                  className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <FaUser />
                  <span>{currentUser.name}</span>
                </Link>
                <button className="nav-link logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/signin" 
                  className={`nav-link ${isActive('/signin') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <FaSignInAlt />
                  <span>Sign In</span>
                </Link>
                <Link 
                  to="/signup" 
                  className={`nav-link ${isActive('/signup') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <FaUserPlus />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>

        <button className="navbar-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;