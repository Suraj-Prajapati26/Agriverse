import { useState, useEffect } from 'react';
import {
  FaCreditCard,
  FaRupeeSign,
  FaSpinner,
  FaUser,
  FaCalendar,
  FaFileInvoice
} from 'react-icons/fa';
import './PaymentManagement.css';

function PaymentManagement({ token }) {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8082/api/payments', {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        setError('Failed to load payments');
      }
    } catch (error) {
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPaymentDetails = async (paymentId) => {
    try {
      const response = await fetch(`http://localhost:8082/api/payments/${paymentId}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedPayment(data);
      } else {
        setError('Failed to load payment details');
      }
    } catch (error) {
      setError('Failed to load payment details');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
        return '#27ae60';
      case 'pending':
        return '#f39c12';
      case 'failed':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="loading">
        <FaSpinner className="spinning" />
        <p>Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="payment-management">
      <h2>Payment Management</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="payment-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'success' ? 'active' : ''}`}
          onClick={() => setFilter('success')}
        >
          Success
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
          onClick={() => setFilter('failed')}
        >
          Failed
        </button>
      </div>

      <div className="payments-grid">
        {filteredPayments.map(payment => (
          <div key={payment.id} className="payment-card">
            <div className="payment-header">
              <div className="payment-id">
                <FaFileInvoice />
                <strong>Payment #{payment.id}</strong>
              </div>
              <div 
                className="payment-status"
                style={{ backgroundColor: getStatusColor(payment.status) }}
              >
                {payment.status}
              </div>
            </div>

            <div className="payment-details">
              <div className="detail-row">
                <FaUser />
                <span>User ID: {payment.userId}</span>
              </div>
              <div className="detail-row">
                <FaFileInvoice />
                <span>Order ID: {payment.orderId}</span>
              </div>
              <div className="detail-row">
                <FaRupeeSign />
                <strong>{payment.amount.toFixed(2)}</strong>
              </div>
              <div className="detail-row">
                <FaCreditCard />
                <span>{payment.method}</span>
              </div>
              <div className="detail-row">
                <FaCalendar />
                <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {payment.method === 'RAZORPAY' && (
              <div className="razorpay-details">
                <div className="detail-row">
                  <strong>Razorpay Order ID:</strong>
                  <span>{payment.razorpayOrderId}</span>
                </div>
                <div className="detail-row">
                  <strong>Razorpay Payment ID:</strong>
                  <span>{payment.razorpayPaymentId}</span>
                </div>
              </div>
            )}

            <button
              className="btn-details"
              onClick={() => loadPaymentDetails(payment.id)}
            >
              View Full Details
            </button>

            {selectedPayment?.id === payment.id && (
              <div className="payment-full-details">
                <h4>Payment Details</h4>
                <pre>
                  {JSON.stringify(selectedPayment, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaymentManagement;
