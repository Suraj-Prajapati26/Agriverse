import { useState, useEffect } from 'react';
import {
  FaBox,
  FaClock,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaSpinner,
  FaUserAlt
} from 'react-icons/fa';
import './OrderManagement.css';

function OrderManagement({ token }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8082/api/orders', {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setError('Failed to load orders');
      }
    } catch (error) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`http://localhost:8082/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        loadOrders();
      } else {
        setError('Failed to update order status');
      }
    } catch (error) {
      setError('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#f39c12';
      case 'processing':
        return '#3498db';
      case 'shipped':
        return '#2ecc71';
      case 'delivered':
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <FaSpinner className="spinning" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="order-management">
      <h2>Order Management</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="orders-grid">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-id">
                <strong>Order #{order.id}</strong>
              </div>
              <div 
                className="order-status"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {order.status}
              </div>
            </div>

            <div className="order-details">
              <div className="detail-row">
                <FaUserAlt />
                <span>User ID: {order.userId}</span>
              </div>
              <div className="detail-row">
                <FaMapMarkerAlt />
                <span>{order.shippingAddress}</span>
              </div>
              <div className="detail-row">
                <FaRupeeSign />
                <strong>{order.totalPrice.toFixed(2)}</strong>
              </div>
              <div className="detail-row">
                <FaClock />
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <FaBox />
                <span>{order.items?.length || 0} items</span>
              </div>
            </div>

            <div className="order-actions">
              <button
                className="btn-info"
                onClick={() => setSelectedOrder(order)}
              >
                <FaInfoCircle /> View Details
              </button>
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                className="status-select"
              >
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {selectedOrder?.id === order.id && (
              <div className="order-items">
                <h4>Order Items</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Product ID</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map(item => (
                      <tr key={item.productId}>
                        <td>{item.productId}</td>
                        <td>{item.quantity}</td>
                        <td>
                          <FaRupeeSign />{item.price.toFixed(2)}
                        </td>
                        <td>
                          <FaRupeeSign />{(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderManagement;
