import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Orders from './pages/Orders';

import cartService from './services/cart.service';
import authService from './services/auth.service';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [authTrigger, setAuthTrigger] = useState(false);

  const fetchCartCount = async () => {
    if (!authService.getCurrentUser()) {
      setCartCount(0);
      return;
    }
    try {
      const cart = await cartService.getCart();
      const count = cart.items.reduce((total, item) => total + item.quantity, 0);
      setCartCount(count);
    } catch (err) {
      console.error('Failed to update cart count badge', err);
    }
  };

  useEffect(() => {
    fetchCartCount();

    // Event listeners for global cart updates
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    const handleOpenCartDrawer = () => {
      setIsCartOpen(true);
    };

    window.addEventListener('cart-update', handleCartUpdate);
    window.addEventListener('open-cart-drawer', handleOpenCartDrawer);

    return () => {
      window.removeEventListener('cart-update', handleCartUpdate);
      window.removeEventListener('open-cart-drawer', handleOpenCartDrawer);
    };
  }, []);

  const triggerError = (msg) => {
    setErrorMessage(msg);
    // Auto-dismiss alert after 4 seconds
    setTimeout(() => {
      setErrorMessage('');
    }, 4000);
  };

  const handleAuthChange = () => {
    setAuthTrigger(prev => !prev);
    fetchCartCount();
  };

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100 bg-light-green-subtle">
        {/* Navbar */}
        <Navbar 
          cartCount={cartCount} 
          onCartClick={() => setIsCartOpen(true)}
          onAuthChange={handleAuthChange}
        />

        {/* Global Toast Alert */}
        {errorMessage && (
          <div className="container position-fixed top-4 start-50 translate-middle-x z-2000 animate-fade-in" style={{ maxWidth: '500px' }}>
            <div className="alert alert-warning border-0 shadow-lg rounded-pill p-3 d-flex align-items-center justify-content-between bg-warning-glass text-dark" role="alert">
              <span className="fw-semibold d-flex align-items-center gap-2 ms-2">
                <i className="bi bi-exclamation-triangle-fill fs-5 text-warning-dark"></i>
                {errorMessage}
              </span>
              <button 
                type="button" 
                className="btn-close ms-3 border-0 bg-transparent" 
                onClick={() => setErrorMessage('')}
              ></button>
            </div>
          </div>
        )}

        {/* Sliding Cart Sidebar */}
        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)}
          onCartUpdate={fetchCartCount}
        />

        {/* Content Views */}
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home triggerError={triggerError} />} />
            <Route path="/shop" element={<Shop triggerError={triggerError} />} />
            <Route path="/products/:id" element={<ProductDetails triggerError={triggerError} />} />
            <Route path="/cart" element={<Cart triggerError={triggerError} />} />
            <Route path="/checkout" element={<Checkout triggerError={triggerError} />} />
            <Route path="/login" element={<Login onAuthChange={handleAuthChange} triggerError={triggerError} />} />
            <Route path="/register" element={<Register triggerError={triggerError} />} />
            <Route path="/admin" element={<AdminDashboard triggerError={triggerError} />} />
            <Route path="/profile" element={<Profile triggerError={triggerError} />} />
            <Route path="/orders" element={<Orders triggerError={triggerError} />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
