import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cartService from '../services/cart.service';
import orderService from '../services/order.service';
import authService from '../services/auth.service';

const Checkout = ({ triggerError }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  useEffect(() => {
    const loadCheckoutDetails = async () => {
      if (!authService.getCurrentUser()) {
        setLoading(false);
        return;
      }
      try {
        const [cartData, profileData] = await Promise.all([
          cartService.getCart(),
          authService.getProfile()
        ]);
        setCart(cartData);
        // Prefill form
        setName(profileData.name || '');
        setPhone(profileData.phone || '');
        setAddress(profileData.address || '');
      } catch (err) {
        triggerError('Failed to fetch checkout information.');
      } finally {
        setLoading(false);
      }
    };
    loadCheckoutDetails();
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!name || !phone || !address || !city || !state || !zip) {
      triggerError('Please fill out all shipping details.');
      return;
    }

    const fullShippingAddress = `${name}, ${address}, ${city}, ${state} - ${zip}`;
    const orderPayload = {
      shippingAddress: fullShippingAddress,
      phone,
      paymentMethod
    };

    try {
      setSubmitting(true);
      const placedOrder = await orderService.placeOrder(orderPayload);
      setOrderPlaced(placedOrder);
      window.dispatchEvent(new Event('cart-update'));
    } catch (err) {
      triggerError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading checkout details...</span>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="container py-5 text-center">
        <div className="card border-0 shadow-sm rounded-4 p-5 max-w-600 mx-auto">
          <i className="bi bi-check-circle-fill text-success display-1 mb-4 animate-scale"></i>
          <h2 className="fw-black text-success-dark">Order Placed Successfully!</h2>
          <p className="lead text-muted mb-4">Thank you for shopping with AgriMarket. Your order id is <strong>#{orderPlaced.id}</strong>.</p>
          
          <div className="card bg-light border-0 p-4 rounded-3 text-start mb-4">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Delivery Summary</h5>
            <p className="mb-2"><strong>Recipient Name:</strong> {name}</p>
            <p className="mb-2"><strong>Contact Number:</strong> {orderPlaced.phone}</p>
            <p className="mb-2"><strong>Shipping Address:</strong> {orderPlaced.shippingAddress}</p>
            <p className="mb-2"><strong>Payment Mode:</strong> {orderPlaced.paymentMethod}</p>
            <p className="mb-0"><strong>Total Charge Paid:</strong> ₹{orderPlaced.totalAmount.toFixed(2)}</p>
          </div>

          <div className="d-flex justify-content-center gap-3">
            <Link to="/orders" className="btn btn-success rounded-pill px-4 fw-bold">View My Orders</Link>
            <Link to="/shop" className="btn btn-outline-success rounded-pill px-4">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="card border-0 shadow-sm rounded-4 p-5">
          <i className="bi bi-cart-x text-muted display-1 mb-4"></i>
          <h3>Checkout Unavailable</h3>
          <p className="text-muted mb-4">Your cart is empty. Please select products before checking out.</p>
          <Link to="/shop" className="btn btn-success rounded-pill px-5 py-2 fw-bold">Start Shopping</Link>
        </div>
      </div>
    );
  }

  const deliveryCharge = cart.totalAmount >= 499 ? 0 : 50;
  const grandTotal = cart.totalAmount + deliveryCharge;

  return (
    <div className="container py-5">
      <h1 className="fw-black text-success-dark mb-4">Secure Checkout</h1>
      <div className="row g-4">
        {/* Shipping Form */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h4 className="fw-bold text-success-dark mb-4 border-bottom pb-2">Shipping Information</h4>
            <form onSubmit={handlePlaceOrder}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control rounded-pill bg-light border-0 py-2.5 px-3" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Phone Number</label>
                  <input 
                    type="tel" 
                    className="form-control rounded-pill bg-light border-0 py-2.5 px-3" 
                    required 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Street Address</label>
                  <input 
                    type="text" 
                    className="form-control rounded-pill bg-light border-0 py-2.5 px-3" 
                    required 
                    placeholder="House/Apartment Number, Street details" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label fw-semibold text-muted fs-8 text-uppercase">City</label>
                  <input 
                    type="text" 
                    className="form-control rounded-pill bg-light border-0 py-2.5 px-3" 
                    required 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-muted fs-8 text-uppercase">State</label>
                  <input 
                    type="text" 
                    className="form-control rounded-pill bg-light border-0 py-2.5 px-3" 
                    required 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Pincode</label>
                  <input 
                    type="text" 
                    className="form-control rounded-pill bg-light border-0 py-2.5 px-3" 
                    required 
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                  />
                </div>
              </div>

              <h4 className="fw-bold text-success-dark mt-5 mb-4 border-bottom pb-2">Payment Method</h4>
              <div className="d-flex flex-column gap-3 mb-4">
                <div className="form-check p-3 border rounded-3 bg-light bg-opacity-40 d-flex align-items-center">
                  <input 
                    className="form-check-input ms-0 me-3" 
                    type="radio" 
                    name="paymentMethod" 
                    id="cod" 
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={() => setPaymentMethod('Cash on Delivery')}
                  />
                  <label className="form-check-label w-100 fw-semibold cursor-pointer" htmlFor="cod">
                    <i className="bi bi-cash-coin text-success me-2 fs-5"></i> Cash on Delivery (COD)
                  </label>
                </div>
                <div className="form-check p-3 border rounded-3 bg-light bg-opacity-40 d-flex align-items-center">
                  <input 
                    className="form-check-input ms-0 me-3" 
                    type="radio" 
                    name="paymentMethod" 
                    id="upi"
                    checked={paymentMethod === 'UPI / NetBanking'}
                    onChange={() => setPaymentMethod('UPI / NetBanking')}
                  />
                  <label className="form-check-label w-100 fw-semibold cursor-pointer" htmlFor="upi">
                    <i className="bi bi-phone text-success me-2 fs-5"></i> UPI Instant Transfer (GPay / PhonePe)
                  </label>
                </div>
                <div className="form-check p-3 border rounded-3 bg-light bg-opacity-40 d-flex align-items-center">
                  <input 
                    className="form-check-input ms-0 me-3" 
                    type="radio" 
                    name="paymentMethod" 
                    id="card"
                    checked={paymentMethod === 'Credit / Debit Card'}
                    onChange={() => setPaymentMethod('Credit / Debit Card')}
                  />
                  <label className="form-check-label w-100 fw-semibold cursor-pointer" htmlFor="card">
                    <i className="bi bi-credit-card text-success me-2 fs-5"></i> Credit or Debit Cards
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="btn btn-success rounded-pill w-100 py-3 fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2 mt-4 hover-scale-102"
              >
                <i className="bi bi-shield-lock-fill"></i>
                <span>{submitting ? 'Placing Order...' : `Place Secure Order (₹${grandTotal.toFixed(2)})`}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Checkout Summary Sidebar */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top-aside bg-light">
            <h4 className="fw-bold text-success-dark mb-4 border-bottom pb-2">Order Summary</h4>
            
            <div className="d-flex flex-column gap-3 mb-4 overflow-y-auto" style={{ maxHeight: '300px' }}>
              {cart.items.map((item) => (
                <div key={item.id} className="d-flex align-items-center justify-content-between p-2 border-bottom border-light">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-success rounded-circle px-2">{item.quantity}</span>
                    <span className="fw-semibold text-truncate" style={{ maxWidth: '180px' }}>{item.productName}</span>
                  </div>
                  <span className="fw-semibold">₹{item.subTotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted">Items Total:</span>
              <span className="fw-semibold">₹{cart.totalAmount.toFixed(2)}</span>
            </div>
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
              <span className="text-muted">Delivery Charges:</span>
              <span className="text-success fw-bold">{deliveryCharge === 0 ? 'FREE' : '₹50.00'}</span>
            </div>

            <div className="d-flex align-items-center justify-content-between">
              <span className="fw-bold fs-5">Grand Total:</span>
              <span className="fs-3 fw-black text-success-dark">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
