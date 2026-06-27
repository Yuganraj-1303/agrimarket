import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

const Register = ({ triggerError }) => {
  const navigate = useNavigate();
  
  // Registration state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !name || !phone || !address) {
      triggerError('Please fill in all required fields.');
      return;
    }

    const role = isAdmin ? 'ADMIN' : 'CUSTOMER';

    try {
      setLoading(true);
      await authService.register(username, email, password, name, phone, address, role);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please check the inputs.';
      triggerError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden max-w-600 w-100 bg-white">
        <div className="bg-success-dark text-white p-5 text-center">
          <h2 className="fw-black mb-1 text-white">Create Account</h2>
          <p className="text-white-70 mb-0">Join AgriMarket to order fresh produce direct from farmers.</p>
        </div>
        <div className="p-5">
          {success ? (
            <div className="alert alert-success text-center py-4 rounded-3" role="alert">
              <i className="bi bi-check-circle-fill display-4 mb-3 d-block"></i>
              <h5 className="fw-bold">Registration Successful!</h5>
              <p className="mb-0 text-muted">Redirecting you to the sign-in page...</p>
            </div>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Username*</label>
                  <input 
                    type="text" 
                    className="form-control rounded-pill bg-light border-0 py-2.5 px-3" 
                    required 
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Email Address*</label>
                  <input 
                    type="email" 
                    className="form-control rounded-pill bg-light border-0 py-2.5 px-3" 
                    required 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Password*</label>
                  <input 
                    type="password" 
                    className="form-control rounded-pill bg-light border-0 py-2.5 px-3" 
                    required 
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Full Name*</label>
                  <input 
                    type="text" 
                    className="form-control rounded-pill bg-light border-0 py-2.5 px-3" 
                    required 
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Phone Number*</label>
                  <input 
                    type="tel" 
                    className="form-control rounded-pill bg-light border-0 py-2.5 px-3" 
                    required 
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="col-md-6 d-flex align-items-center justify-content-start pt-3">
                  <div className="form-check form-switch p-3 border rounded-pill bg-light w-100 d-flex align-items-center justify-content-between">
                    <label className="form-check-label fw-bold text-success-dark ms-2" htmlFor="roleSwitch">
                      Register as Admin
                    </label>
                    <input 
                      className="form-check-input me-2" 
                      type="checkbox" 
                      id="roleSwitch"
                      checked={isAdmin}
                      onChange={(e) => setIsAdmin(e.target.checked)}
                    />
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Street Address*</label>
                  <textarea 
                    className="form-control rounded-4 bg-light border-0 py-2.5 px-3" 
                    required 
                    rows="2"
                    placeholder="Default shipping location address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-success rounded-pill w-100 py-3 fw-bold shadow-lg hover-scale-102 mt-4"
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>
          )}

          {!success && (
            <div className="text-center mt-4">
              <span className="text-muted">Already have an account? </span>
              <Link to="/login" className="text-success fw-bold text-decoration-none hover-underline">Login Here</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
