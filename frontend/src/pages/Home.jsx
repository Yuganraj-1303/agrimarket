import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import productService from '../services/product.service';
import categoryService from '../services/category.service';
import ProductCard from '../components/ProductCard';

const Home = ({ triggerError }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [cats, prods] = await Promise.all([
          categoryService.getAllCategories(),
          productService.getAllProducts()
        ]);
        setCategories(cats);
        // Show up to 4 featured products
        setFeaturedProducts(prods.slice(0, 4));
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleCategoryClick = (id) => {
    navigate(`/shop?categoryId=${id}`);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section 
        className="hero-section text-white d-flex align-items-center position-relative overflow-hidden mb-5 py-5"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(27, 67, 50, 0.9), rgba(27, 67, 50, 0.4)), url('/hero_banner.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '520px',
        }}
      >
        <div className="container py-5 z-1 position-relative">
          <div className="row">
            <div className="col-lg-6 col-md-8 text-center text-md-start animate-fade-in">
              <span className="badge bg-warning text-dark fw-bold px-3 py-2 rounded-pill mb-3 text-uppercase tracking-wider">
                100% Organic & Direct from Farm
              </span>
              <h1 className="display-3 fw-black mb-3 text-white lh-1">
                Healthy Eating <br />
                Starts with <span className="text-warning-gold">Fresh Food</span>
              </h1>
              <p className="lead text-white-80 mb-4 fs-5">
                Connecting local farming communities directly to your dining table. Experience pure taste, nutrient-rich produce, and fast delivery.
              </p>
              <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-3">
                <Link to="/shop" className="btn btn-warning btn-lg rounded-pill px-5 fw-bold shadow-lg text-uppercase fs-6 hover-scale-105">
                  Shop Now
                </Link>
                <a href="#categories" className="btn btn-outline-light btn-lg rounded-pill px-4 fw-semibold text-uppercase fs-6 hover-scale-105">
                  Browse Categories
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mb-5 pb-4">
        <div className="row g-4 text-center">
          <div className="col-md-3 col-sm-6">
            <div className="p-4 border rounded-4 bg-white shadow-sm h-100 hover-translate-y">
              <i className="bi bi-truck text-success fs-1 mb-2"></i>
              <h5 className="fw-bold">Free Shipping</h5>
              <p className="text-muted fs-7 mb-0">On all orders above ₹499</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="p-4 border rounded-4 bg-white shadow-sm h-100 hover-translate-y">
              <i className="bi bi-award text-success fs-1 mb-2"></i>
              <h5 className="fw-bold">100% Organic</h5>
              <p className="text-muted fs-7 mb-0">Certified pesticide-free items</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="p-4 border rounded-4 bg-white shadow-sm h-100 hover-translate-y">
              <i className="bi bi-people text-success fs-1 mb-2"></i>
              <h5 className="fw-bold">Farmer Direct</h5>
              <p className="text-muted fs-7 mb-0">Empowering local farming communities</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="p-4 border rounded-4 bg-white shadow-sm h-100 hover-translate-y">
              <i className="bi bi-currency-rupee text-success fs-1 mb-2"></i>
              <h5 className="fw-bold">Best Price</h5>
              <p className="text-muted fs-7 mb-0">Honest pricing without middle-men</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="container mb-5 py-3">
        <div className="text-center mb-5">
          <h2 className="fw-black text-success-dark position-relative d-inline-block pb-2">
            Explore Categories
            <span className="position-absolute bottom-0 start-50 translate-middle-x bg-warning" style={{ width: '60px', height: '4px', borderRadius: '2px' }}></span>
          </h2>
          <p className="text-muted mt-2">Pick from our freshly harvested agricultural sections</p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading Categories...</span>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="alert alert-info text-center">No categories found in the database.</div>
        ) : (
          <div className="row g-4">
            {categories.map((cat) => (
              <div key={cat.id} className="col-lg-3 col-md-6 col-sm-6">
                <div 
                  onClick={() => handleCategoryClick(cat.id)}
                  className="card text-white border-0 rounded-4 overflow-hidden shadow-sm category-card position-relative cursor-pointer"
                  style={{ height: '260px' }}
                >
                  <img 
                    src={cat.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'} 
                    alt={cat.name} 
                    className="card-img w-100 h-100 object-fit-cover transition-transform duration-500"
                  />
                  <div className="card-img-overlay d-flex flex-column justify-content-end bg-gradient-dark p-4">
                    <h4 className="card-title fw-bold text-white mb-1">{cat.name}</h4>
                    <p className="card-text text-white-80 fs-7 mb-0 text-truncate-2">{cat.description}</p>
                    <span className="btn btn-warning btn-sm rounded-pill mt-3 align-self-start fw-bold px-3">
                      View All <i className="bi bi-arrow-right-short"></i>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="container mb-5 py-3">
        <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
          <h2 className="fw-black text-success-dark mb-0">Featured Products</h2>
          <Link to="/shop" className="btn btn-outline-success rounded-pill px-4 fw-semibold">
            See All Catalog <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading Products...</span>
            </div>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="alert alert-info text-center">No products currently listed. Please check back later.</div>
        ) : (
          <div className="row g-4">
            {featuredProducts.map((prod) => (
              <div key={prod.id} className="col-lg-3 col-md-6 col-sm-6">
                <ProductCard 
                  product={prod} 
                  triggerError={triggerError}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
