import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaEdit,
  FaBell,
  FaShoppingCart,
  FaChartLine,
  FaKey,
  FaTrash
} from 'react-icons/fa';

function Profile() {
  const { currentUser, token, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    location: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        location: currentUser.location || ''
      });
      loadUserData();
    }
  }, [currentUser, token]);

  const loadUserData = async () => {
    try {
      // Load notifications
      const notificationsResponse = await fetch('http://localhost:8081/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (notificationsResponse.ok) {
        const userNotifications = await notificationsResponse.json();
        setNotifications(userNotifications);
      }

      // Load orders
      const ordersResponse = await fetch('http://localhost:8082/api/orders/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (ordersResponse.ok) {
        const userOrders = await ordersResponse.json();
        setOrders(userOrders);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:8081/api/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setEditing(false);
        // Refresh user data
        window.location.reload();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:8081/api/users/me/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        }),
      });

      if (response.ok) {
        setMessage('Password changed successfully!');
        setShowPasswordForm(false);
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:8081/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      loadUserData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch('http://localhost:8081/api/users/me', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          logout();
          window.location.href = '/';
        } else {
          setError('Failed to delete account. Please try again.');
        }
      } catch (error) {
        setError('Network error. Please try again.');
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="auth-required">
            <h2>Please Sign In</h2>
            <p>You need to be signed in to view your profile.</p>
            <a href="/signin" className="btn btn-primary">Sign In</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>
            <FaUser />
            My Profile
          </h1>
          <p>Manage your account settings and view your activity</p>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="profile-content">
          {/* Profile Information */}
          <div className="profile-section">
            <div className="section-header">
              <h3>Profile Information</h3>
              <button
                onClick={() => setEditing(!editing)}
                className="btn btn-secondary"
              >
                <FaEdit />
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label className="form-label">
                    <FaUser />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaPhone />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaMapMarkerAlt />
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-item">
                  <FaUser />
                  <div>
                    <label>Full Name</label>
                    <span>{currentUser.name}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FaEnvelope />
                  <div>
                    <label>Email</label>
                    <span>{currentUser.email}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FaPhone />
                  <div>
                    <label>Phone</label>
                    <span>{currentUser.phone}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FaMapMarkerAlt />
                  <div>
                    <label>Location</label>
                    <span>{currentUser.location}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Password Section */}
          <div className="profile-section">
            <div className="section-header">
              <h3>Security</h3>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="btn btn-secondary"
              >
                <FaKey />
                Change Password
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="password-form">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            )}
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat-card">
              <FaShoppingCart />
              <div>
                <h4>{orders.length}</h4>
                <p>Total Orders</p>
              </div>
            </div>
            <div className="stat-card">
              <FaBell />
              <div>
                <h4>{notifications.length}</h4>
                <p>Notifications</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          {orders.length > 0 && (
            <div className="profile-section">
              <h3>Recent Orders</h3>
              <div className="orders-list">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="order-item">
                    <div className="order-info">
                      <span className="order-id">Order #{order.id}</span>
                      <span className={`order-status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-details">
                      <span className="order-total">₹{order.totalPrice}</span>
                      <span className="order-date">
                        {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="profile-section">
              <h3>Recent Notifications</h3>
              <div className="notifications-list">
                {notifications.slice(0, 5).map(notification => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                  >
                    <div className="notification-content">
                      <p>{notification.message}</p>
                      <span className="notification-type">{notification.type}</span>
                    </div>
                    {!notification.read && <div className="unread-dot"></div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="profile-section danger-zone">
            <h3>Danger Zone</h3>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button
              onClick={deleteAccount}
              className="btn btn-danger"
            >
              <FaTrash />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;