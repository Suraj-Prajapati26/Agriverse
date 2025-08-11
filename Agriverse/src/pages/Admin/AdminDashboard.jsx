import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [notificationForm, setNotificationForm] = useState({
    message: '',
    type: 'INFO'
  });
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'Admin') {
      navigate('/');
      return;
    }
    fetchUsers();
    fetchNotifications();
  }, [user, navigate]);

  const getAuthHeaders = () => {
    if (!token) {
      navigate('/signin');
      throw new Error('No authentication token available');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/users', {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/signin');
          return;
        }
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/notifications/all', {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/signin');
          return;
        }
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:8081/api/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole })
      });
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/signin');
          return;
        }
        throw new Error('Failed to update user role');
      }
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:8081/api/users/${userId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          if (response.status === 401) {
            navigate('/signin');
            return;
          }
          throw new Error('Failed to delete user');
        }
        await fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleBroadcastNotification = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8081/api/notifications/broadcast', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(notificationForm)
      });
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/signin');
          return;
        }
        throw new Error('Failed to broadcast notification');
      }
      setNotificationForm({ message: '', type: 'INFO' });
      await fetchNotifications();
    } catch (error) {
      console.error('Error broadcasting notification:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        const response = await fetch(`http://localhost:8081/api/notifications/${notificationId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          if (response.status === 401) {
            navigate('/signin');
            return;
          }
          throw new Error('Failed to delete notification');
        }
        await fetchNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-tabs">
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="users-section">
          <h2>User Management</h2>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      >
                        <option value="Farmer">Farmer</option>
                        <option value="Admin">Admin</option>
                        <option value="Advisor">Advisor</option>
                      </select>
                    </td>
                    <td>{user.location}</td>
                    <td>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="notifications-section">
          <h2>Notification Management</h2>
          <div className="broadcast-form">
            <h3>Broadcast New Notification</h3>
            <form onSubmit={handleBroadcastNotification}>
              <div className="form-group">
                <label>Message:</label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({
                    ...notificationForm,
                    message: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type:</label>
                <select
                  value={notificationForm.type}
                  onChange={(e) => setNotificationForm({
                    ...notificationForm,
                    type: e.target.value
                  })}
                >
                  <option value="INFO">Info</option>
                  <option value="WARNING">Warning</option>
                  <option value="ERROR">Error</option>
                </select>
              </div>
              <button type="submit" className="broadcast-button">
                Broadcast Notification
              </button>
            </form>
          </div>

          <div className="notifications-list">
            <h3>All Notifications</h3>
            <div className="notifications-table">
              <table>
                <thead>
                  <tr>
                    <th>Message</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map(notification => (
                    <tr key={notification.id}>
                      <td>{notification.message}</td>
                      <td>{notification.type}</td>
                      <td>{new Date(notification.createdAt).toLocaleString()}</td>
                      <td>
                        <button 
                          className="delete-button"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
