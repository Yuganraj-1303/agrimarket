import React, { useEffect, useState } from 'react';
import authService from '../services/auth.service';

const Profile = ({ triggerError }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authService.getCurrentUser()) {
        setLoading(false);
        return;
      }
      try {
        const data = await authService.getProfile();
        setUsername(data.username);
        setEmail(data.email);
        setRole(data.role);
        setName(data.name || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
      } catch (err) {
        triggerError('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await authService.updateProfile({
        name,
        phone,
        address
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      triggerError('Failed to update profile details.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="max-w-700 mx-auto">
        <h1 className="fw-black text-success-dark mb-4">My Account Profile</h1>
        
        {success && (
          <div className="alert alert-success alert-dismissible fade show rounded-pill px-4 py-3" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i> Profile updated successfully!
            <button type="button" className="btn-close" onClick={() => setSuccess(false)}></button>
          </div>
        )}

        <div className="card border-0 shadow-sm rounded-4 p-5">
          <form onSubmit={handleUpdate}>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Username</label>
                <input type="text" className="form-control rounded-pill bg-light border-0 py-2.5 px-3" disabled value={username} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Email Address</label>
                <input type="text" className="form-control rounded-pill bg-light border-0 py-2.5 px-3" disabled value={email} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Account Privilege Role</label>
                <input type="text" className="form-control rounded-pill bg-light border-0 py-2.5 px-3 text-uppercase" disabled value={role.replace('ROLE_', '')} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Full Name</label>
                <input 
                  type="text" 
                  className="form-control rounded-pill bg-light border-0 py-2.5 px-3" 
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Phone Number</label>
                <input 
                  type="tel" 
                  className="form-control rounded-pill bg-light border-0 py-2.5 px-3" 
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Default Shipping Address</label>
                <textarea 
                  className="form-control rounded-4 bg-light border-0 py-2.5 px-3" 
                  rows="3"
                  placeholder="Enter shipping address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={updating}
              className="btn btn-success rounded-pill px-5 py-2.5 fw-bold shadow mt-4 hover-scale-102"
            >
              {updating ? 'Saving Details...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
