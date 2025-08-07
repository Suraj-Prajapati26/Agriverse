import React, { useEffect, useState } from 'react';
import { FaBell, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Notifications.css';

function Notifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:8081/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setNotifications(data))
        .finally(() => setLoading(false));
    }
  }, [token]);

  const markAsRead = async (id) => {
    await fetch(`http://localhost:8081/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="notifications-page">
      <h2><FaBell /> Notifications</h2>
      {notifications.length === 0 ? <p>No notifications.</p> : (
        <ul className="notifications-list">
          {notifications.map(n => (
            <li key={n.id} className={n.read ? 'read' : ''}>
              {n.message}
              {!n.read && (
                <button onClick={() => markAsRead(n.id)}><FaCheckCircle /> Mark as read</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
