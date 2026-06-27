import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

const Login = ({ onAuthChange, triggerError }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      triggerError('Please fill out all fields.');
      return;
    }

    try {
      setLoading(true);
      const data = await authService.login(username, password);
      
      // Dispatch events for immediate header/cart UI sync
      window.dispatchEvent(new Event('auth-update'));
      window.dispatchEvent(new Event('cart-update'));
      
      if (onAuthChange) onAuthChange();
      
      // Redirect based on role
      if (data.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your username and password.';
      triggerError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '65vh' }}>
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden max-w-500 w-100 bg-white">
        <div className="bg-success-dark text-white p-5 text-center">
          <h2 className="fw-black mb-1 text-white">Welcome Back</h2>
          <p className="text-white-70 mb-0">Log in to manage your cart and check out fresh products.</p>
        </div>
        <div className="p-5">
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Username</label>
              <div className="input-group bg-light rounded-pill border-0 px-3 align-items-center">
                <i className="bi bi-person text-muted me-2"></i>
                <input 
                  type="text" 
                  className="form-control bg-transparent border-0 py-2.5 px-0 text-dark focus-none" 
                  placeholder="Enter your username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Password</label>
              <div className="input-group bg-light rounded-pill border-0 px-3 align-items-center">
                <i className="bi bi-shield-lock text-muted me-2"></i>
                <input 
                  type="password" 
                  className="form-control bg-transparent border-0 py-2.5 px-0 text-dark focus-none" 
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-success rounded-pill w-100 py-3 fw-bold shadow-lg hover-scale-102 mt-3"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted">Don't have an account? </span>
            <Link to="/register" className="text-success fw-bold text-decoration-none hover-underline">Register Here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
