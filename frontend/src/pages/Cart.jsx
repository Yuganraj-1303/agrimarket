import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cartService from '../services/cart.service';
import authService from '../services/auth.service';

const Cart = ({ triggerError }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!authService.getCurrentUser()) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      triggerError('Failed to retrieve cart items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (itemId, currentQty, amount, stockQty) => {
    const newQty = currentQty + amount;
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    if (newQty > stockQty) {
      triggerError(`Cannot add more. Only ${stockQty} items left in stock.`);
      return;
    }

    try {
      await cartService.updateQuantity(itemId, newQty);
      fetchCart();
      window.dispatchEvent(new Event('cart-update'));
    } catch (err) {
      triggerError(err.response?.data?.message || 'Failed to update quantity.');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await cartService.removeFromCart(itemId);
      fetchCart();
      window.dispatchEvent(new Event('cart-update'));
    } catch (err) {
      triggerError('Failed to remove item.');
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      fetchCart();
      window.dispatchEvent(new Event('cart-update'));
    } catch (err) {
      triggerError('Failed to clear cart.');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading cart...</span>
        </div>
      </div>
    );
  }

  if (!authService.getCurrentUser()) {
    return (
      <div className="container py-5 text-center">
        <div className="card border-0 shadow-sm rounded-4 p-5 max-w-500 mx-auto">
          <i className="bi bi-lock-fill text-success display-1 mb-4"></i>
          <h3>Please Log In</h3>
          <p className="text-muted mb-4">You must login to view your cart items.</p>
          <Link to="/login" className="btn btn-success rounded-pill px-5 py-2 fw-bold">Log In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="fw-black text-success-dark mb-4">My Shopping Cart</h1>

      {!cart || cart.items.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <i className="bi bi-cart-x text-muted display-1 mb-4"></i>
          <h3>Your Cart is Empty</h3>
          <p className="text-muted mb-4">Look around the store and select fresh agricultural products.</p>
          <Link to="/shop" className="btn btn-success rounded-pill px-5 py-2 fw-bold">Shop Now</Link>
        </div>
      ) : (
        <div className="row g-4">
          {/* Items list */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
                <span className="fw-bold fs-5 text-success-dark">{cart.items.length} Products Selected</span>
                <button onClick={handleClearCart} className="btn btn-outline-danger btn-sm rounded-pill px-3">
                  Clear All Cart
                </button>
              </div>

              <div className="d-flex flex-column gap-3">
                {cart.items.map((item) => (
                  <div key={item.id} className="row g-3 align-items-center p-3 border rounded-3 bg-light bg-opacity-40">
                    {/* Item Image */}
                    <div className="col-md-2 col-sm-3 col-4">
                      <div className="ratio ratio-1x1 rounded overflow-hidden">
                        <img 
                          src={item.productImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'} 
                          alt={item.productName} 
                          className="w-100 h-100 object-fit-cover"
                        />
                      </div>
                    </div>

                    {/* Name & price */}
                    <div className="col-md-4 col-sm-5 col-8">
                      <h6 className="fw-bold mb-1 text-truncate">{item.productName}</h6>
                      <span className="text-muted fs-8 d-block mb-1">Unit: ₹{item.productPrice.toFixed(2)}</span>
                      <span className="text-success-dark fw-bold">₹{item.productPrice.toFixed(2)}</span>
                    </div>

                    {/* Quantity adjust */}
                    <div className="col-md-3 col-sm-4 col-6">
                      <div className="btn-group border rounded-pill bg-white overflow-hidden shadow-sm">
                        <button 
                          className="btn btn-link text-dark text-decoration-none px-2 py-0 border-0 fs-5"
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1, item.stockQuantity)}
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <span className="px-3 py-1 align-self-center fw-bold text-muted fs-7">{item.quantity}</span>
                        <button 
                          className="btn btn-link text-dark text-decoration-none px-2 py-0 border-0 fs-5"
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1, item.stockQuantity)}
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                    </div>

                    {/* Subtotal & trash */}
                    <div className="col-md-3 col-sm-12 col-6 text-end">
                      <div className="d-flex align-items-center justify-content-between justify-content-md-end gap-3 w-100">
                        <span className="fs-5 fw-bold text-success-dark">₹{item.subTotal.toFixed(2)}</span>
                        <button onClick={() => handleRemoveItem(item.id)} className="btn btn-link text-danger text-decoration-none p-0">
                          <i className="bi bi-trash fs-5"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing side summary */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-light">
              <h4 className="fw-bold text-success-dark mb-4">Summary</h4>
              
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <span className="text-muted">Cart Total:</span>
                <span className="fw-bold">₹{cart.totalAmount.toFixed(2)}</span>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-4 pb-2">
                <span className="text-muted">Delivery Charges:</span>
                <span className="text-success fw-bold">{cart.totalAmount >= 499 ? 'FREE' : '₹50.00'}</span>
              </div>

              <div className="d-flex align-items-center justify-content-between mb-4 border-top pt-3">
                <span className="fw-bold fs-5">Grand Total:</span>
                <span className="fs-3 fw-black text-success-dark">
                  ₹{(cart.totalAmount >= 499 ? cart.totalAmount : cart.totalAmount + 50).toFixed(2)}
                </span>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="btn btn-success rounded-pill w-100 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
