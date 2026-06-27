import React from 'react';
import { Link } from 'react-router-dom';
import cartService from '../services/cart.service';
import authService from '../services/auth.service';

const ProductCard = ({ product, onCartUpdate, triggerError }) => {
  const isOutOfStock = product.stockQuantity <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent navigating to details page when clicking button

    if (!authService.getCurrentUser()) {
      triggerError('Please log in to add items to your cart.');
      return;
    }

    try {
      await cartService.addToCart(product.id, 1);
      if (onCartUpdate) onCartUpdate();
      window.dispatchEvent(new Event('cart-update'));
      
      // Dispatch a custom event to open the cart drawer automatically
      window.dispatchEvent(new Event('open-cart-drawer'));
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add item to cart';
      triggerError(errorMsg);
    }
  };

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden product-card transition-all">
      <div className="position-relative overflow-hidden" style={{ height: '220px' }}>
        <img 
          src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'} 
          className="card-img-top w-100 h-100 object-fit-cover transition-transform duration-500 hover-scale-110" 
          alt={product.name} 
        />
        <span className={`position-absolute top-3 end-3 badge rounded-pill px-3 py-2 fw-semibold ${isOutOfStock ? 'bg-danger' : 'bg-success-light text-success-dark'}`}>
          {isOutOfStock ? 'Out of Stock' : 'In Stock'}
        </span>
        <span className="position-absolute bottom-3 start-3 badge bg-dark bg-opacity-75 text-white rounded-pill px-3 py-1 fs-8">
          {product.categoryName}
        </span>
      </div>
      <div className="card-body d-flex flex-column p-4">
        <Link to={`/products/${product.id}`} className="text-decoration-none text-dark">
          <h5 className="card-title fw-bold text-truncate-2 mb-2 hover-text-success">{product.name}</h5>
        </Link>
        <p className="card-text text-muted fs-7 text-truncate-3 flex-grow-1 mb-3">{product.description}</p>
        
        <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top border-light">
          <div>
            <span className="text-muted fs-8 d-block text-uppercase fw-bold">Price</span>
            <span className="fs-4 fw-black text-success-dark">₹{product.price.toFixed(2)}</span>
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`btn rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm transition-all ${isOutOfStock ? 'btn-secondary opacity-50' : 'btn-success hover-scale-105'}`}
          >
            <i className="bi bi-cart-plus"></i>
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
