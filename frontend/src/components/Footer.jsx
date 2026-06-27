import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row text-center text-md-start">
          <div className="col-md-4 col-lg-4 col-xl-3 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-success-light d-flex align-items-center gap-2">
              <i className="bi bi-flower1"></i> AgriMarket
            </h5>
            <p className="text-white-50">
              Connecting local farmers directly to your kitchen. Providing fresh, organic, and locally harvested agricultural goods at honest prices.
            </p>
          </div>

          <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning-gold">Products</h5>
            <p><Link to="/shop" className="text-white-50 text-decoration-none hover-text-white">Fresh Vegetables</Link></p>
            <p><Link to="/shop" className="text-white-50 text-decoration-none hover-text-white">Organic Fruits</Link></p>
            <p><Link to="/shop" className="text-white-50 text-decoration-none hover-text-white">Grains & Millets</Link></p>
            <p><Link to="/shop" className="text-white-50 text-decoration-none hover-text-white">Dairy & Eggs</Link></p>
          </div>

          <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning-gold">Useful links</h5>
            <p><Link to="/shop" className="text-white-50 text-decoration-none hover-text-white">Our Shop</Link></p>
            <p><Link to="/profile" className="text-white-50 text-decoration-none hover-text-white">My Account</Link></p>
            <p><Link to="/orders" className="text-white-50 text-decoration-none hover-text-white">Track Order</Link></p>
            <p><a href="#" className="text-white-50 text-decoration-none hover-text-white">Help & Support</a></p>
          </div>

          <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning-gold">Contact</h5>
            <p className="text-white-50"><i className="bi bi-house-door me-2 text-success"></i> Coimbatore, TN, India</p>
            <p className="text-white-50"><i className="bi bi-envelope me-2 text-success"></i> support@agrimarket.com</p>
            <p className="text-white-50"><i className="bi bi-telephone me-2 text-success"></i> +91 98765 43210</p>
          </div>
        </div>

        <hr className="mb-4 opacity-10" />

        <div className="row align-items-center">
          <div className="col-md-7 col-lg-8 text-center text-md-start">
            <p className="text-white-50">
              © {new Date().getFullYear()} All Rights Reserved by:
              <strong className="text-success-light"> AgriMarket Inc.</strong>
            </p>
          </div>
          <div className="col-md-5 col-lg-4 text-center text-md-end">
            <div className="d-inline-flex gap-3">
              <a href="#" className="text-white-50 hover-text-white fs-5"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-white-50 hover-text-white fs-5"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="text-white-50 hover-text-white fs-5"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-white-50 hover-text-white fs-5"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
