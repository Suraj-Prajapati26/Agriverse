import { useEffect, useState } from 'react';
import {
  FaBox,
  FaFilter,
  FaMinus,
  FaPlus,
  FaRupeeSign,
  FaSearch,
  FaShoppingBag,
  FaShoppingCart,
  FaSpinner,
  FaStore,
  FaTags
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Marketplace.css';

// Razorpay script loader
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function Marketplace() {
  const { currentUser, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState('');

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    loadMarketplaceData();
    if (currentUser && token) {
      loadOrders();
    }
  }, [currentUser, token]);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      // Load categories
      const categoriesResponse = await fetch('http://localhost:8082/api/categories', {
        headers: getAuthHeaders()
      });
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }

      // Load products
      const productsResponse = await fetch('http://localhost:8082/api/products', {
        headers: getAuthHeaders()
      });
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error loading marketplace data:', error);
      setError('Failed to load marketplace data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch(`http://localhost:8082/api/orders/user/${currentUser.id}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const ordersData = await response.json();
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevCart.filter(item => item.productId !== productId);
      }
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const initializeRazorpayOrder = async (amount) => {
    try {
      // Razorpay expects amount in paise (integer)
      const amountPaise = Math.round(amount * 100);
      const response = await fetch('http://localhost:8082/api/payment/create-order', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount: amountPaise })
      });
      const responseBody = await response.text();
      console.log('Razorpay order response:', response.status, responseBody); // Debug log
      if (!response.ok) {
        throw new Error('Failed to create Razorpay order: ' + responseBody);
      }
      return JSON.parse(responseBody);
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  };

  const placeOrder = async () => {
  try {
    setOrderLoading(true);

    if (!Array.isArray(cart) || cart.length === 0) {
      setOrderSuccess('Cart is empty');
      setOrderLoading(false);
      return;
    }

    // 1. Load Razorpay SDK
    const res = await loadRazorpayScript();
    if (!res) {
      throw new Error('Razorpay SDK failed to load');
    }

    // Get total amount
    const totalAmount = parseFloat(getCartTotal().toFixed(2));

    // Prepare order items
    const orderItems = cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: parseFloat(item.price.toFixed(2))
    }));

    // 2. Create order in backend FIRST
    const orderData = {
      userId: currentUser.id,
      items: orderItems,
      totalPrice: totalAmount,
      status: "PENDING",
      paymentStatus: "PENDING",
      shippingAddress: currentUser.address || "Default Address",
      orderDate: new Date().toISOString()
    };

    const orderResponse = await fetch('http://localhost:8082/api/orders', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    const newOrder = await orderResponse.json();
    if (!orderResponse.ok) {
      throw new Error(newOrder.message || 'Failed to create order');
    }

    // 3. Initiate Razorpay Payment with real orderId
    const initiateResponse = await fetch('http://localhost:8082/api/payments/initiate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        orderId: newOrder.id,
        amount: newOrder.totalPrice
      })
    });

    const initiateData = await initiateResponse.json();
    if (!initiateResponse.ok) {
      throw new Error(initiateData.message || 'Failed to initiate Razorpay payment');
    }

    // 4. Open Razorpay Payment Window
    const options = {
      key: "rzp_test_your_key_id", // Replace with your Razorpay test key
      amount: initiateData.amount * 100, // amount in paise
      currency: initiateData.currency || "INR",
      name: "Agriverse Marketplace",
      description: "Purchase from Agriverse",
      order_id: initiateData.id, // Razorpay Order ID
      handler: async function (response) {
        try {
          // 5. Capture payment
          const capturePayload = {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId: newOrder.id,
            userId: currentUser.id,
            amount: totalAmount
          };

          const captureResponse = await fetch('http://localhost:8082/api/payments/capture', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(capturePayload)
          });

          const captureData = await captureResponse.json();
          if (!captureResponse.ok) {
            throw new Error(captureData.message || 'Failed to capture payment');
          }

          // 6. Update order status
          await fetch(`http://localhost:8082/api/orders/${newOrder.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ paymentStatus: 'PAID', status: 'CONFIRMED' })
          });

          setCart([]);
          setShowCart(false);
          setOrderSuccess('Order placed and payment successful!');
          loadOrders();
          setTimeout(() => setOrderSuccess(''), 3000);
        } catch (error) {
          console.error('Error capturing payment:', error);
          setOrderSuccess('Payment failed. Please try again.');
          setTimeout(() => setOrderSuccess(''), 3000);
        }
      },
      prefill: {
        name: currentUser.name || '',
        email: currentUser.email || '',
        contact: currentUser.phone || ''
      },
      theme: {
        color: "#3399cc"
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();

  } catch (error) {
    console.error('Error in payment process:', error);
    setOrderSuccess(error.message || 'Failed to initialize payment. Please try again.');
    setTimeout(() => setOrderSuccess(''), 3000);
  } finally {
    setOrderLoading(false);
  }
};


  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cancelOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:8082/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        loadOrders();
        setOrderSuccess('Order cancelled successfully');
        setTimeout(() => setOrderSuccess(''), 3000);
      } else {
        throw new Error('Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      setOrderSuccess('Failed to cancel order');
      setTimeout(() => setOrderSuccess(''), 3000);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return loading ? (
    <div className="loading">
      <div className="spinner"></div>
      <p>Loading marketplace...</p>
    </div>
  ) : (
    <div className="marketplace">
      <div className="container">
        {/* Header */}
        <div className="marketplace-header">
          <div className="header-content">
            <h1>
              <FaStore />
              Marketplace
            </h1>
            <p>Discover quality agricultural products and supplies</p>
          </div>
          
          {currentUser && (
            <div className="cart-section">
              <button 
                className="cart-button"
                onClick={() => setShowCart(!showCart)}
              >
                <FaShoppingCart />
                <span className="cart-count">{getCartItemCount()}</span>
                Cart
              </button>
            </div>
          )}
        </div>

        {orderSuccess && (
          <div className="alert alert-success">
            {orderSuccess}
          </div>
        )}

        {/* Filters */}
        <div className="marketplace-filters">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="category-filter">
            <FaFilter />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="" key="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="marketplace-content">
          {/* Products Grid */}
          <div className="products-section">
            <div className="section-header">
              <h2>Products ({filteredProducts.length})</h2>
            </div>
            
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.productId} className="product-card">
                  <div className="product-header">
                    <div className="product-category">
                      <FaTags />
                      {getCategoryName(product.categoryId)}
                    </div>
                    <div className="product-stock">
                      <FaBox />
                      {product.stock} in stock
                    </div>
                  </div>
                  
                  {product.imageUrl && (
                    <div className="product-image">
                      <img src={product.imageUrl} alt={product.name} />
                    </div>
                  )}
                  
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    
                    <div className="product-price">
                      <FaRupeeSign />
                      {product.price.toFixed(2)}
                    </div>
                    <div className="product-date">
                      Listed on: {new Date(product.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {currentUser && (
                    <div className="product-actions">
                      <div className="quantity-controls">
                        <button 
                          onClick={() => removeFromCart(product.productId)}
                          className="btn-quantity"
                        >
                          <FaMinus />
                        </button>
                        <span className="quantity">
                          {cart.find(item => item.productId === product.productId)?.quantity || 0}
                        </span>
                        <button 
                          onClick={() => addToCart(product)}
                          className="btn-quantity"
                          disabled={product.stock === 0}
                        >
                          <FaPlus />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => addToCart(product)}
                        className="btn btn-primary"
                        disabled={product.stock === 0}
                      >
                        <FaShoppingCart />
                        Add to Cart
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          {currentUser && showCart && (
            <div className="cart-sidebar">
              <div className="cart-header">
                <h3>
                  <FaShoppingBag />
                  Shopping Cart
                </h3>
                <button 
                  className="close-cart"
                  onClick={() => setShowCart(false)}
                >
                  ×
                </button>
              </div>
              <div className="cart-items">
                {(Array.isArray(cart) && cart.length === 0) ? (
                  <p className="empty-cart">Your cart is empty</p>
                ) : (
                  Array.isArray(cart) ? cart.map(item => (
                    <div key={item.productId} className="cart-item">
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <p><FaRupeeSign />{item.price} × {item.quantity}</p>
                      </div>
                      <div className="cart-item-controls">
                        <button onClick={() => removeFromCart(item.productId)}>
                          <FaMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => addToCart(item)}>
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                  )) : null
                )}
              </div>
              {Array.isArray(cart) && cart.length > 0 && (
                <div className="cart-footer">
                  <div className="cart-total">
                    <strong>Total: <FaRupeeSign />{getCartTotal()}</strong>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={placeOrder}
                    disabled={orderLoading}
                  >
                    {orderLoading ? <FaSpinner className="spinning" /> : 'Place Order'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* My Orders Section */}
        {currentUser && orders.length > 0 && (
          <div className="orders-section">
            <h2>My Orders</h2>
            <div className="orders-grid">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">Order #{order.id}</span>
                    <span className={`order-status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    <p><strong>Total: <FaRupeeSign />{order.totalPrice}</strong></p>
                    <p>Items: {order.items?.length || 0}</p>
                    <p>Address: {order.shippingAddress}</p>
                    <p>Payment Status: {order.paymentStatus || 'PENDING'}</p>
                  </div>
                  {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                    <div className="order-actions">
                      <button
                        className="btn btn-danger"
                        onClick={() => cancelOrder(order.id)}
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Marketplace;
