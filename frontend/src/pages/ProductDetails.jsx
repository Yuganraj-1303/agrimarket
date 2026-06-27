import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../services/product.service';
import cartService from '../services/cart.service';
import authService from '../services/auth.service';

const ProductDetails = ({ triggerError }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        triggerError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (amount) => {
    const newQty = quantity + amount;
    if (newQty >= 1 && newQty <= (product?.stockQuantity || 1)) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (!authService.getCurrentUser()) {
      triggerError('Please log in to add items to your cart.');
      return;
    }

    try {
      setAdding(true);
      await cartService.addToCart(product.id, quantity);
      window.dispatchEvent(new Event('cart-update'));
      window.dispatchEvent(new Event('open-cart-drawer'));
    } catch (err) {
      triggerError(err.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading product details...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">Product not found.</div>
        <Link to="/shop" className="btn btn-success rounded-pill px-4">Back to Shop</Link>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/" className="text-success text-decoration-none">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/shop" className="text-success text-decoration-none">Shop</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="row g-5">
        {/* Product Image */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ minHeight: '380px' }}>
            <img 
              src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'} 
              alt={product.name} 
              className="w-100 h-100 object-fit-cover img-fluid"
            />
          </div>
        </div>

        {/* Product Details Panel */}
        <div className="col-md-6">
          <div className="d-flex flex-column h-100 justify-content-center">
            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 fs-7 align-self-start mb-3 fw-bold">
              {product.categoryName}
            </span>
            <h1 className="fw-black text-success-dark mb-2 display-5">{product.name}</h1>
            
            <div className="d-flex align-items-center gap-3 mb-4">
              <span className="fs-2 fw-black text-success-dark">₹{product.price.toFixed(2)}</span>
              <span className={`badge rounded-pill px-3 py-2 fw-semibold ${isOutOfStock ? 'bg-danger' : 'bg-success-light text-success-dark'}`}>
                {isOutOfStock ? 'Out of Stock' : `${product.stockQuantity} Items Available`}
              </span>
            </div>

            <div className="border-top border-bottom border-light py-4 mb-4">
              <h5 className="fw-bold mb-2">Product Description</h5>
              <p className="text-muted leading-relaxed mb-0">{product.description}</p>
            </div>

            {!isOutOfStock && (
              <div className="row g-3 align-items-center mb-4">
                <div className="col-auto">
                  <span className="fw-bold text-muted small text-uppercase">Quantity:</span>
                </div>
                <div className="col-auto">
                  <div className="btn-group border rounded-pill bg-light overflow-hidden shadow-sm">
                    <button 
                      className="btn btn-link text-dark text-decoration-none px-3 py-1 border-0 fs-5"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <span className="px-3 align-self-center fw-bold text-muted">{quantity}</span>
                    <button 
                      className="btn btn-link text-dark text-decoration-none px-3 py-1 border-0 fs-5"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stockQuantity}
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="d-flex gap-3">
              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding}
                className={`btn btn-lg rounded-pill px-5 py-3 fw-bold flex-grow-1 shadow-sm d-flex align-items-center justify-content-center gap-2 transition-all ${isOutOfStock ? 'btn-secondary opacity-50' : 'btn-success hover-scale-103'}`}
              >
                <i className="bi bi-cart-plus-fill fs-5"></i>
                <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
              </button>

              <Link to="/shop" className="btn btn-outline-success btn-lg rounded-pill px-4 py-3 fw-semibold">
                Back to Shop
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
