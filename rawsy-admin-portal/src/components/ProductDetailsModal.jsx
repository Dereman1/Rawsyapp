import React from 'react';
import './ProductDetailsModal.css';

function ProductDetailsModal({ product, onClose }) {
  const images = product.images || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="modal-header">
          <h2>{product.name}</h2>
          <span className={`status-badge ${getStatusClass(product.status)}`}>
            {product.status}
          </span>
        </div>

        <div className="modal-body">
          <div className="details-section">
            <div className="images-gallery">
              <h3>Product Images</h3>
              <div className="images-container">
                {images.length > 0 ? (
                  images.map((image, index) => (
                    <div key={index} className="image-item">
                      <img
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x300?text=Image+Error';
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="no-images">
                    <p>No images available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="product-details">
              <h3>Product Information</h3>

              <div className="detail-group">
                <label>Supplier</label>
                <p>{product.supplier?.name || product.supplierName || 'N/A'}</p>
              </div>

              <div className="detail-group">
                <label>Category</label>
                <p>{product.category || 'N/A'}</p>
              </div>

              <div className="detail-group">
                <label>Price</label>
                <p>${(product.price || 0).toFixed(2)}</p>
              </div>

              <div className="detail-group">
                <label>Stock</label>
                <p>{product.stock || 0} units</p>
              </div>

              <div className="detail-group">
                <label>Description</label>
                <p className="description-text">
                  {product.description || 'No description provided'}
                </p>
              </div>

              {product.specifications && (
                <div className="detail-group">
                  <label>Specifications</label>
                  <div className="specifications-list">
                    {typeof product.specifications === 'object' ? (
                      Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="spec-item">
                          <span className="spec-key">{key}:</span>
                          <span className="spec-value">{String(value)}</span>
                        </div>
                      ))
                    ) : (
                      <p>{product.specifications}</p>
                    )}
                  </div>
                </div>
              )}

              {product.status === 'rejected' && product.rejectionReason && (
                <div className="detail-group rejection-reason">
                  <label>Rejection Reason</label>
                  <p className="rejection-text">{product.rejectionReason}</p>
                </div>
              )}

              <div className="detail-group meta-info">
                <label>Created</label>
                <p>{new Date(product.createdAt).toLocaleString()}</p>
              </div>

              {product.updatedAt && (
                <div className="detail-group meta-info">
                  <label>Last Updated</label>
                  <p>{new Date(product.updatedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-close-modal">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function getStatusClass(status) {
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
}

export default ProductDetailsModal;
