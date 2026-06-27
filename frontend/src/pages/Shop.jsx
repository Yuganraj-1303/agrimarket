import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '../services/product.service';
import categoryService from '../services/category.service';
import ProductCard from '../components/ProductCard';

const Shop = ({ triggerError }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [sortBy, setSortBy] = useState('name'); // name, priceAsc, priceDesc

  useEffect(() => {
    // Load categories once
    const loadCategories = async () => {
      try {
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const catId = selectedCategory ? parseInt(selectedCategory) : null;
      const data = await productService.getAllProducts(catId, searchQuery);
      setProducts(data);
    } catch (err) {
      triggerError('Failed to fetch products catalogue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch products whenever search queries or category changes
    loadProducts();
    
    // Synchronize search params in URL
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.categoryId = selectedCategory;
    setSearchParams(params);
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProducts();
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.categoryId = selectedCategory;
    setSearchParams(params);
  };

  const getSortedProducts = () => {
    const sorted = [...products];
    if (sortBy === 'priceAsc') {
      return sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      return sorted.sort((a, b) => b.price - a.price);
    } else {
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
  };

  const sortedProducts = getSortedProducts();

  return (
    <div className="container py-5">
      <div className="row g-4">
        {/* Filters Sidebar */}
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top-aside">
            <h4 className="fw-bold text-success-dark mb-4 d-flex align-items-center gap-2">
              <i className="bi bi-funnel"></i>
              <span>Filters</span>
            </h4>

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <label className="form-label fw-semibold text-muted small text-uppercase">Search Product</label>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control rounded-start-pill border-end-0 bg-light" 
                  placeholder="Apples, Rice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-success rounded-end-pill px-3">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </form>

            {/* Category selection */}
            <div className="mb-4">
              <label className="form-label fw-semibold text-muted small text-uppercase">Category</label>
              <div className="d-flex flex-column gap-2">
                <button 
                  onClick={() => setSelectedCategory('')}
                  className={`btn text-start rounded-pill px-3 py-2 fw-semibold border-0 ${selectedCategory === '' ? 'btn-success text-white shadow-sm' : 'btn-light hover-bg-light text-dark'}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id.toString())}
                    className={`btn text-start rounded-pill px-3 py-2 fw-semibold border-0 ${selectedCategory === cat.id.toString() ? 'btn-success text-white shadow-sm' : 'btn-light hover-bg-light text-dark'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting selection */}
            <div>
              <label className="form-label fw-semibold text-muted small text-uppercase">Sort By</label>
              <select 
                className="form-select rounded-pill bg-light border-0 py-2 px-3 fw-semibold"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Product Name (A-Z)</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="col-lg-9">
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="fw-black text-success-dark mb-0">Browse Products</h2>
              <p className="text-muted mb-0">{sortedProducts.length} items found</p>
            </div>
            
            {/* Quick search input fallback for mobile */}
            <div className="d-lg-none w-100 mt-2">
              <form onSubmit={handleSearchSubmit} className="d-flex">
                <input 
                  type="text" 
                  className="form-control rounded-pill me-2" 
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-success rounded-pill px-4">Search</button>
              </form>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading Catalogue...</span>
              </div>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-5 border rounded-4 bg-light bg-opacity-40">
              <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
              <h4>No Products Match Your Search</h4>
              <p className="text-muted">Try adjusting your filters, selecting another category, or writing a different keyword.</p>
              <button 
                onClick={() => { setSelectedCategory(''); setSearchQuery(''); }}
                className="btn btn-success rounded-pill px-4 mt-3"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {sortedProducts.map((prod) => (
                <div key={prod.id} className="col-md-4 col-sm-6">
                  <ProductCard 
                    product={prod} 
                    triggerError={triggerError}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
