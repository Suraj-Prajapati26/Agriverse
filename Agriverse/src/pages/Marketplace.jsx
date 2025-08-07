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

function Marketplace() {
  const { currentUser, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState('');

  useEffect(() => {
    loadMarketplaceData();
    if (currentUser && token) {
      loadOrders();
    }
  }, [currentUser, token]);

  const loadMarketplaceData = async () => {
    try {
      // Load categories
      const categoriesResponse = await fetch('http://localhost:8082/api/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }

      // Load products
      const productsResponse = await fetch('http://localhost:8082/api/products');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error loading marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/orders/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
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
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevCart.filter(item => item.id !== productId);
      }
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const placeOrder = async () => {
    if (!currentUser || cart.length === 0) return;

    setOrderLoading(true);
    try {
      const orderData = {
        order: {
          userId: currentUser.id,
          shippingAddress: currentUser.location || 'Address not provided',
          totalPrice: getCartTotal()
        },
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await fetch('http://localhost:8082/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setCart([]);
        setShowCart(false);
        setOrderSuccess('Order placed successfully!');
        loadOrders();
        setTimeout(() => setOrderSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error placing order:', error);
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

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading marketplace...</p>
      </div>
    );
  }

  return (
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
              <option value="">All Categories</option>
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
                <div key={product.id} className="product-card">
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
                  
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    
                    <div className="product-price">
                      <FaRupeeSign />
                      {product.price}
                    </div>
                  </div>
                  
                  {currentUser && (
                    <div className="product-actions">
                      <div className="quantity-controls">
                        <button 
                          onClick={() => removeFromCart(product.id)}
                          className="btn-quantity"
                        >
                          <FaMinus />
                        </button>
                        <span className="quantity">
                          {cart.find(item => item.id === product.id)?.quantity || 0}
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
                {cart.length === 0 ? (
                  <p className="empty-cart">Your cart is empty</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <p><FaRupeeSign />{item.price} × {item.quantity}</p>
                      </div>
                      <div className="cart-item-controls">
                        <button onClick={() => removeFromCart(item.id)}>
                          <FaMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => addToCart(item)}>
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {cart.length > 0 && (
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
                  </div>
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