import React, { useState, useEffect } from 'react';
import ProductDetailsModal from './ProductDetailsModal';
import './ProductModeration.css';

function ProductModeration() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingProductId, setRejectingProductId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');

      const response = await fetch('http://localhost:4000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      const allProducts = Array.isArray(data) ? data : data.products || [];
      setProducts(allProducts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProduct = async (productId) => {
    try {
      setActionLoading(productId);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`http://localhost:4000/api/admin/products/${productId}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve product');
      }

      await fetchProducts();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectProduct = async (productId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(productId);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`http://localhost:4000/api/admin/products/${productId}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject', reason: rejectionReason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject product');
      }

      setRejectionReason('');
      setRejectingProductId(null);
      await fetchProducts();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFlagProduct = async (productId) => {
    try {
      setActionLoading(productId);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`http://localhost:4000/api/admin/products/${productId}/flag`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flagged: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to flag product');
      }

      await fetchProducts();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'rejected':
        return 'badge-error';
      case 'flagged':
        return 'badge-danger';
      default:
        return 'badge-default';
    }
  };

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    if (filter === 'pending') return product.status === 'pending';
    if (filter === 'approved') return product.status === 'approved';
    if (filter === 'rejected') return product.status === 'rejected';
    if (filter === 'flagged') return product.flagged === true;
    return true;
  });

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="product-moderation">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-moderation">
      <div className="management-header">
        <h2>Product Moderation</h2>
        <button onClick={fetchProducts} className="refresh-button">
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="filter-section">
        <button
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          All ({products.length})
        </button>
        <button
          className={filter === 'pending' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('pending')}
        >
          Pending ({products.filter(p => p.status === 'pending').length})
        </button>
        <button
          className={filter === 'approved' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('approved')}
        >
          Approved ({products.filter(p => p.status === 'approved').length})
        </button>
        <button
          className={filter === 'rejected' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({products.filter(p => p.status === 'rejected').length})
        </button>
        <button
          className={filter === 'flagged' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('flagged')}
        >
          Flagged ({products.filter(p => p.flagged === true).length})
        </button>
      </div>

      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Supplier</th>
              <th>Category</th>
              <th>Status</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>{product.name || 'N/A'}</td>
                  <td>{product.supplier?.name || product.supplierName || 'N/A'}</td>
                  <td>{product.category || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>${(product.price || 0).toFixed(2)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openProductDetails(product)}
                        className="btn-view"
                      >
                        View
                      </button>

                      {product.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveProduct(product._id)}
                            disabled={actionLoading === product._id}
                            className="btn-approve"
                          >
                            {actionLoading === product._id ? '...' : 'Approve'}
                          </button>

                          {rejectingProductId === product._id ? (
                            <div className="reject-form">
                              <textarea
                                placeholder="Reason for rejection"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="reject-textarea"
                              />
                              <button
                                onClick={() => handleRejectProduct(product._id)}
                                disabled={actionLoading === product._id}
                                className="btn-reject-confirm"
                              >
                                {actionLoading === product._id ? '...' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingProductId(null);
                                  setRejectionReason('');
                                }}
                                className="btn-reject-cancel"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRejectingProductId(product._id)}
                              className="btn-reject"
                            >
                              Reject
                            </button>
                          )}
                        </>
                      )}

                      {product.flagged ? (
                        <span className="flagged-label">Flagged</span>
                      ) : product.status !== 'rejected' && (
                        <button
                          onClick={() => handleFlagProduct(product._id)}
                          disabled={actionLoading === product._id}
                          className="btn-flag"
                        >
                          {actionLoading === product._id ? '...' : 'Flag'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => {
            setShowModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}

export default ProductModeration;
