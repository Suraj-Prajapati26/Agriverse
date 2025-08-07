import {
    FaEnvelope,
    FaFacebook,
    FaHeart,
    FaInstagram,
    FaLinkedin,
    FaMapMarkerAlt,
    FaPhone,
    FaSeedling,
    FaTwitter
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-brand">
            <FaSeedling className="brand-icon" />
            <h3>AgriVerse</h3>
          </div>
          <p className="footer-description">
            Empowering farmers with technology for sustainable agriculture and better yields.
          </p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/marketplace">Marketplace</Link></li>
            <li><Link to="/weather">Weather</Link></li>
            <li><Link to="/prediction">Crop Prediction</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Services</h4>
          <ul>
            <li>Market Analysis</li>
            <li>Weather Forecasting</li>
            <li>Crop Disease Detection</li>
            <li>Yield Prediction</li>
            <li>Farm Management</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Info</h4>
          <div className="contact-info">
            <p>
              <FaMapMarkerAlt />
              <span>123 Agri Street, Tech Valley</span>
            </p>
            <p>
              <FaPhone />
              <span>+91 123 456 7890</span>
            </p>
            <p>
              <FaEnvelope />
              <span>contact@agriverse.com</span>
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} AgriVerse. Made with <FaHeart className="heart-icon" /> for Indian Farmers
        </p>
      </div>
    </footer>
  );
}

export default Footer;
