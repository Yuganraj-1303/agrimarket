import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

const Navbar = ({ cartCount, onCartClick, onAuthChange }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());

    // Listen for auth updates
    const handleAuthUpdate = () => {
      setCurrentUser(authService.getCurrentUser());
    };

    window.addEventListener('auth-update', handleAuthUpdate);
    return () => {
      window.removeEventListener('auth-update', handleAuthUpdate);
    };
  }, [onAuthChange]);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    if (onAuthChange) onAuthChange();
    window.dispatchEvent(new Event('auth-update'));
    window.dispatchEvent(new Event('cart-update'));
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success-dark sticky-top shadow-sm px-md-4">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-white fs-3" to="/">
          <i className="bi bi-flower1 text-warning-gold animate-bounce"></i>
          <span>Agri<span className="text-warning-gold">Market</span></span>
        </Link>
        
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarText">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-lg-3 ms-lg-4">
            <li className="nav-item">
              <Link className="nav-link text-white-50 hover-text-white fw-semibold" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white-50 hover-text-white fw-semibold" to="/shop">Shop Catalogue</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            {/* Cart Button */}
            <button 
              onClick={onCartClick} 
              className="btn btn-outline-light d-flex align-items-center gap-2 rounded-pill px-3 py-2 border-opacity-25 hover-warning position-relative"
            >
              <i className="bi bi-cart3 fs-5"></i>
              <span className="d-none d-md-inline fw-semibold">My Cart</span>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light animate-scale">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth Dropdown / Buttons */}
            {currentUser ? (
              <div className="dropdown">
                <button 
                  className="btn btn-success rounded-pill px-3 py-2 dropdown-toggle d-flex align-items-center gap-2 shadow-sm border border-success-light"
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle fs-5 text-warning-gold"></i>
                  <span className="fw-semibold">{currentUser.username}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3" aria-labelledby="userDropdown">
                  <li className="px-3 py-2 border-bottom text-muted fs-7">
                    Logged in as <strong>{currentUser.role.replace('ROLE_', '')}</strong>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2 d-flex align-items-center gap-2" to="/profile">
                      <i className="bi bi-person text-success"></i> My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2 d-flex align-items-center gap-2" to="/orders">
                      <i className="bi bi-bag-check text-success"></i> Order History
                    </Link>
                  </li>
                  {currentUser.role === 'ROLE_ADMIN' && (
                    <>
                      <div className="dropdown-divider"></div>
                      <li>
                        <Link className="dropdown-item py-2 d-flex align-items-center gap-2 fw-semibold text-success" to="/admin">
                          <i className="bi bi-speedometer2"></i> Admin Dashboard
                        </Link>
                      </li>
                    </>
                  )}
                  <div className="dropdown-divider"></div>
                  <li>
                    <button onClick={handleLogout} className="dropdown-item py-2 text-danger d-flex align-items-center gap-2">
                      <i className="bi bi-box-arrow-right"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link className="btn btn-link text-white text-decoration-none fw-semibold px-3" to="/login">Login</Link>
                <Link className="btn btn-warning rounded-pill px-4 fw-bold shadow-sm" to="/register">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
