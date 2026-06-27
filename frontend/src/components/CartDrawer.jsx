import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cartService from '../services/cart.service';
import authService from '../services/auth.service';

const CartDrawer = ({ isOpen, onClose, onCartUpdate }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCart = async () => {
    if (!authService.getCurrentUser()) return;
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
      setError('');
    } catch (err) {
      setError('Could not fetch cart items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  useEffect(() => {
    // Listen for cart-update events (so additions from card refresh the drawer)
    const handleCartUpdate = () => {
      if (isOpen) fetchCart();
    };

    window.addEventListener('cart-update', handleCartUpdate);
    return () => {
      window.removeEventListener('cart-update', handleCartUpdate);
    };
  }, [isOpen]);

  const handleQuantityChange = async (itemId, currentQty, amount, stockQty) => {
    const newQty = currentQty + amount;
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    if (newQty > stockQty) {
      setError(`Cannot add more. Only ${stockQty} items left in stock.`);
      return;
    }

    try {
      await cartService.updateQuantity(itemId, newQty);
      fetchCart();
      if (onCartUpdate) onCartUpdate();
      window.dispatchEvent(new Event('cart-update'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quantity.');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await cartService.removeFromCart(itemId);
      fetchCart();
      if (onCartUpdate) onCartUpdate();
      window.dispatchEvent(new Event('cart-update'));
    } catch (err) {
      setError('Failed to remove item.');
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      fetchCart(null);
      if (onCartUpdate) onCartUpdate();
      window.dispatchEvent(new Event('cart-update'));
    } catch (err) {
      setError('Failed to clear cart.');
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-1040 transition-fade"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div 
        className="position-fixed top-0 end-0 h-100 bg-white shadow-lg z-1050 d-flex flex-column transition-slide drawer-width"
        style={{ width: '450px', maxWidth: '100%' }}
      >
        {/* Header */}
        <div className="p-4 border-bottom d-flex align-items-center justify-content-between bg-light">
          <h5 className="fw-bold mb-0 text-success-dark d-flex align-items-center gap-2">
            <i className="bi bi-cart3"></i>
            <span>My Shopping Cart</span>
          </h5>
          <button 
            type="button" 
            className="btn-close text-reset border-0 bg-transparent fs-5" 
            onClick={onClose}
          ></button>
        </div>

        {/* Content */}
        <div className="flex-grow-1 overflow-y-auto p-4">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          {!authService.getCurrentUser() ? (
            <div className="text-center py-5">
              <i className="bi bi-lock fs-1 text-muted mb-3 d-block"></i>
              <p className="text-muted mb-4">Please log in to view and manage your shopping cart.</p>
              <button 
                onClick={() => { onClose(); navigate('/login'); }} 
                className="btn btn-success rounded-pill px-4"
              >
                Log In
              </button>
            </div>
          ) : loading && !cart ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-cart-x fs-1 text-muted mb-3 d-block"></i>
              <p className="text-muted">Your shopping cart is empty.</p>
              <button 
                onClick={() => { onClose(); navigate('/shop'); }} 
                className="btn btn-outline-success rounded-pill px-4 mt-3"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {cart.items.map((item) => (
                <div key={item.id} className="d-flex align-items-center gap-3 p-3 border rounded-3 bg-light bg-opacity-40">
                  <div style={{ width: '70px', height: '70px' }} className="flex-shrink-0 rounded overflow-hidden">
                    <img 
                      src={item.productImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'} 
                      alt={item.productName} 
                      className="w-100 h-100 object-fit-cover"
                    />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="fw-bold text-truncate mb-1">{item.productName}</h6>
                    <span className="text-success fw-bold d-block mb-2">₹{item.productPrice.toFixed(2)}</span>
                    
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="btn-group border rounded-pill overflow-hidden bg-white shadow-sm" size="sm">
                        <button 
                          className="btn btn-link text-dark text-decoration-none px-2 py-0 border-0 fs-5"
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1, item.stockQuantity)}
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <span className="px-3 py-1 align-self-center fw-semibold text-muted fs-7">{item.quantity}</span>
                        <button 
                          className="btn btn-link text-dark text-decoration-none px-2 py-0 border-0 fs-5"
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1, item.stockQuantity)}
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                      
                      <button 
                        className="btn btn-link text-danger text-decoration-none p-0"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="p-4 border-top bg-light mt-auto">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted fw-semibold">Grand Total:</span>
              <span className="fs-3 fw-black text-success-dark">₹{cart.totalAmount.toFixed(2)}</span>
            </div>

            <div className="d-grid gap-2">
              <button 
                onClick={handleCheckout}
                className="btn btn-success rounded-pill py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <i className="bi bi-arrow-right"></i>
              </button>
              <button 
                onClick={handleClearCart}
                className="btn btn-outline-danger btn-sm border-0 rounded-pill mt-1"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
