import { useState, useEffect } from 'react';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import './CategoryManagement.css';

function CategoryManagement({ token }) {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    description: ''
  });

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      setError('Failed to load categories');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8082/api/categories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newCategory)
      });

      if (response.ok) {
        setNewCategory({ name: '', description: '' });
        loadCategories();
      }
    } catch (error) {
      setError('Failed to create category');
    }
  };

  const handleUpdate = async (id) => {
    try {
      const response = await fetch(`http://localhost:8082/api/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        setEditingId(null);
        loadCategories();
      }
    } catch (error) {
      setError('Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`http://localhost:8082/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        loadCategories();
      }
    } catch (error) {
      setError('Failed to delete category');
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditForm({
      name: category.name,
      description: category.description
    });
  };

  return (
    <div className="category-management">
      <h2>Category Management</h2>
      
      {error && <div className="error-message">{error}</div>}

      {/* Create Form */}
      <div className="create-form">
        <h3>Create New Category</h3>
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({
                ...prev,
                name: e.target.value
              }))}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="Category Description"
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({
                ...prev,
                description: e.target.value
              }))}
              required
            />
          </div>
          <button type="submit" className="btn-create">
            <FaPlus /> Create Category
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="categories-list">
        <h3>Categories</h3>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>
                    {editingId === category.id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td>
                    {editingId === category.id ? (
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          description: e.target.value
                        }))}
                      />
                    ) : (
                      category.description
                    )}
                  </td>
                  <td>
                    {editingId === category.id ? (
                      <>
                        <button
                          className="btn-save"
                          onClick={() => handleUpdate(category.id)}
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
                          onClick={() => startEditing(category)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(category.id)}
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

export default CategoryManagement;
