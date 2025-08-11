import { useState, useEffect } from 'react';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
  FaTimes,
  FaBox,
  FaRupeeSign
} from 'react-icons/fa';
import './ProductManagement.css';

function ProductManagement({ token }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: ''
  });

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  const loadData = async () => {
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
      setError('Failed to load data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8082/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock),
          categoryId: parseInt(newProduct.categoryId)
        })
      });

      if (response.ok) {
        setNewProduct({
          name: '',
          description: '',
          price: '',
          stock: '',
          categoryId: ''
        });
        loadData();
      }
    } catch (error) {
      setError('Failed to create product');
    }
  };

  const handleUpdate = async (id) => {
    try {
      const response = await fetch(`http://localhost:8082/api/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...editForm,
          price: parseFloat(editForm.price),
          stock: parseInt(editForm.stock),
          categoryId: parseInt(editForm.categoryId)
        })
      });

      if (response.ok) {
        setEditingId(null);
        loadData();
      }
    } catch (error) {
      setError('Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`http://localhost:8082/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      setError('Failed to delete product');
    }
  };

  const startEditing = (product) => {
    setEditingId(product.productId);
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      categoryId: product.categoryId.toString()
    });
  };

  return (
    <div className="product-management">
      <h2>Product Management</h2>
      
      {error && <div className="error-message">{error}</div>}

      {/* Create Form */}
      <div className="create-form">
        <h3>Create New Product</h3>
        <form onSubmit={handleCreate}>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={newProduct.categoryId}
                onChange={(e) => setNewProduct(prev => ({
                  ...prev,
                  categoryId: e.target.value
                }))}
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct(prev => ({
                  ...prev,
                  price: e.target.value
                }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                min="0"
                value={newProduct.stock}
                onChange={(e) => setNewProduct(prev => ({
                  ...prev,
                  stock: e.target.value
                }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newProduct.description}
              onChange={(e) => setNewProduct(prev => ({
                ...prev,
                description: e.target.value
              }))}
              required
            />
          </div>

          <button type="submit" className="btn-create">
            <FaPlus /> Create Product
          </button>
        </form>
      </div>

      {/* Products List */}
      <div className="products-list">
        <h3>Products</h3>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.productId}>
                  <td>{product.productId}</td>
                  <td>
                    {editingId === product.productId ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                      />
                    ) : (
                      product.name
                    )}
                  </td>
                  <td>
                    {editingId === product.productId ? (
                      <select
                        value={editForm.categoryId}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          categoryId: e.target.value
                        }))}
                      >
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      categories.find(c => c.id === product.categoryId)?.name || 'Unknown'
                    )}
                  </td>
                  <td>
                    {editingId === product.productId ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          price: e.target.value
                        }))}
                      />
                    ) : (
                      <span className="price">
                        <FaRupeeSign />{product.price.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === product.productId ? (
                      <input
                        type="number"
                        min="0"
                        value={editForm.stock}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          stock: e.target.value
                        }))}
                      />
                    ) : (
                      <span className="stock">
                        <FaBox /> {product.stock}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === product.productId ? (
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          description: e.target.value
                        }))}
                      />
                    ) : (
                      product.description
                    )}
                  </td>
                  <td>
                    {editingId === product.productId ? (
                      <>
                        <button
                          className="btn-save"
                          onClick={() => handleUpdate(product.productId)}
                        >
                          <FaSave />
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => setEditingId(null)}
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn-edit"
                          onClick={() => startEditing(product)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(product.productId)}
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProductManagement;
