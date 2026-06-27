import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../services/product.service';
import categoryService from '../services/category.service';
import orderService from '../services/order.service';
import authService from '../services/auth.service';

const AdminDashboard = ({ triggerError }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    revenue: 0
  });

  // Modal / Form state
  const [activeTab, setActiveTab] = useState('products'); // products, categories, orders
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form Fields
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodImg, setProdImg] = useState('');
  const [prodCategory, setProdCategory] = useState('');

  // Category Form Field
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImg, setCatImg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, cats, ords] = await Promise.all([
        productService.getAllProducts(),
        categoryService.getAllCategories(),
        orderService.getAllOrders()
      ]);
      setProducts(prods);
      setCategories(cats);
      setOrders(ords);

      // Calculate Stats
      const totalRevenue = ords
        .filter(o => o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      setStats({
        products: prods.length,
        categories: cats.length,
        orders: ords.length,
        revenue: totalRevenue
      });
    } catch (err) {
      triggerError('Failed to fetch administrator data dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ROLE_ADMIN') {
      navigate('/login');
      return;
    }
    loadData();
  }, [currentUser]);

  // Open modal for new product
  const handleAddProductClick = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdStock('');
    setProdImg('');
    setProdCategory(categories[0]?.id || '');
    setShowProductModal(true);
  };

  // Open modal for editing product
  const handleEditProductClick = (product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdDesc(product.description);
    setProdPrice(product.price);
    setProdStock(product.stockQuantity);
    setProdImg(product.imageUrl || '');
    setProdCategory(product.categoryId);
    setShowProductModal(true);
  };

  // Save product (New or Edit)
  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!prodName || !prodDesc || !prodPrice || !prodStock || !prodCategory) {
      triggerError('Please fill out all fields.');
      return;
    }

    const payload = {
      name: prodName,
      description: prodDesc,
      price: parseFloat(prodPrice),
      stockQuantity: parseInt(prodStock),
      imageUrl: prodImg,
      categoryId: parseInt(prodCategory)
    };

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload);
      } else {
        await productService.createProduct(payload);
      }
      setShowProductModal(false);
      loadData();
    } catch (err) {
      triggerError('Could not save product details.');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      loadData();
    } catch (err) {
      triggerError('Failed to delete product.');
    }
  };

  // Save category
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!catName) {
      triggerError('Category name is required.');
      return;
    }
    try {
      await categoryService.createCategory({
        name: catName,
        description: catDesc,
        imageUrl: catImg
      });
      setCatName('');
      setCatDesc('');
      setCatImg('');
      loadData();
    } catch (err) {
      triggerError(err.response?.data?.message || 'Failed to create category.');
    }
  };

  // Update order status
  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      loadData();
    } catch (err) {
      triggerError('Failed to update order status.');
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading Admin Panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
        <div>
          <span className="badge bg-success-light text-success-dark fw-bold px-3 py-2 rounded-pill mb-2">Management Console</span>
          <h1 className="fw-black text-success-dark mb-0">Admin Dashboard</h1>
        </div>
        <button onClick={loadData} className="btn btn-outline-success rounded-pill px-4">
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh Data
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="row g-4 mb-5">
        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-success text-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-white-70 small fw-semibold text-uppercase">Total Products</span>
                <h3 className="fw-bold mb-0 mt-1">{stats.products}</h3>
              </div>
              <i className="bi bi-box-seam fs-1 text-white-50"></i>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-primary text-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-white-70 small fw-semibold text-uppercase">Categories</span>
                <h3 className="fw-bold mb-0 mt-1">{stats.categories}</h3>
              </div>
              <i className="bi bi-tag fs-1 text-white-50"></i>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-warning text-dark h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-dark-50 small fw-semibold text-uppercase">Orders Received</span>
                <h3 className="fw-bold mb-0 mt-1">{stats.orders}</h3>
              </div>
              <i className="bi bi-receipt fs-1 text-dark-50"></i>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-dark text-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-white-70 small fw-semibold text-uppercase">Total Sales Revenue</span>
                <h3 className="fw-bold mb-0 mt-1">₹{stats.revenue.toFixed(2)}</h3>
              </div>
              <i className="bi bi-currency-rupee fs-1 text-white-50"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs list navigation */}
      <ul className="nav nav-pills mb-4 border-bottom pb-3 gap-2">
        <li className="nav-item">
          <button 
            className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'products' ? 'btn-success text-white shadow-sm' : 'btn-light text-dark'}`}
            onClick={() => setActiveTab('products')}
          >
            Manage Products
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'categories' ? 'btn-success text-white shadow-sm' : 'btn-light text-dark'}`}
            onClick={() => setActiveTab('categories')}
          >
            Manage Categories
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'orders' ? 'btn-success text-white shadow-sm' : 'btn-light text-dark'}`}
            onClick={() => setActiveTab('orders')}
          >
            Process Orders
          </button>
        </li>
      </ul>

      {/* Tab Panels */}
      {activeTab === 'products' && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <h4 className="fw-bold mb-0 text-success-dark">Product Catalog</h4>
            <button onClick={handleAddProductClick} className="btn btn-success rounded-pill px-4 fw-bold">
              <i className="bi bi-plus-circle me-1"></i> Add Product
            </button>
          </div>
          
          <div className="table-responsive">
            <table className="table align-middle table-hover">
              <thead className="table-light fs-8 text-uppercase fw-bold text-muted">
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Available</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img 
                          src={prod.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=50'} 
                          alt={prod.name} 
                          className="rounded object-fit-cover"
                          style={{ width: '45px', height: '45px' }}
                        />
                        <div>
                          <h6 className="mb-0 fw-bold">{prod.name}</h6>
                          <span className="text-muted fs-8">ID: #{prod.id}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge bg-light text-dark rounded-pill px-3 py-1.5">{prod.categoryName}</span></td>
                    <td className="fw-bold text-success-dark">₹{prod.price.toFixed(2)}</td>
                    <td>
                      <span className={`fw-semibold ${prod.stockQuantity <= 5 ? 'text-danger' : 'text-muted'}`}>
                        {prod.stockQuantity} Items
                      </span>
                      {prod.stockQuantity <= 5 && <span className="text-danger small d-block fs-8">(Low Stock)</span>}
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <button onClick={() => handleEditProductClick(prod)} className="btn btn-outline-primary btn-sm rounded-circle px-2">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button onClick={() => handleDeleteProduct(prod.id)} className="btn btn-outline-danger btn-sm rounded-circle px-2">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="row g-4">
          {/* List Categories */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h4 className="fw-bold mb-4 text-success-dark">Current Categories</h4>
              <div className="row g-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="col-md-6">
                    <div className="d-flex align-items-center gap-3 p-3 border rounded-3 bg-light bg-opacity-40">
                      <img 
                        src={cat.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80'} 
                        alt={cat.name} 
                        className="rounded object-fit-cover flex-shrink-0"
                        style={{ width: '60px', height: '60px' }}
                      />
                      <div className="overflow-hidden">
                        <h6 className="fw-bold mb-1">{cat.name}</h6>
                        <p className="text-muted fs-8 mb-0 text-truncate">{cat.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Category Form */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-light">
              <h4 className="fw-bold mb-4 text-success-dark">Add New Category</h4>
              <form onSubmit={handleCategorySubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Category Name</label>
                  <input 
                    type="text" 
                    className="form-control rounded-pill bg-white border-0 py-2 px-3" 
                    required 
                    placeholder="Fruits, Dairy..."
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Description</label>
                  <textarea 
                    className="form-control rounded-4 bg-white border-0 py-2 px-3" 
                    rows="3" 
                    placeholder="Description text"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Image URL</label>
                  <input 
                    type="url" 
                    className="form-control rounded-pill bg-white border-0 py-2 px-3" 
                    placeholder="https://image-url"
                    value={catImg}
                    onChange={(e) => setCatImg(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-success rounded-pill w-100 py-2.5 fw-bold shadow">
                  Create Category
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <h4 className="fw-bold mb-4 text-success-dark">Process Customer Orders</h4>
          <div className="table-responsive">
            <table className="table align-middle table-hover">
              <thead className="table-light fs-8 text-uppercase fw-bold text-muted">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Address</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-center">Set Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><span className="fw-bold">#{order.id}</span></td>
                    <td>{order.username}</td>
                    <td className="fs-7 text-muted">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="fs-7 text-muted" style={{ maxWidth: '200px' }}>
                      <span className="d-block text-truncate" title={order.shippingAddress}>
                        {order.shippingAddress}
                      </span>
                    </td>
                    <td className="fw-bold text-success-dark">₹{order.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-1.5 fs-8 text-uppercase ${
                        order.status === 'DELIVERED' ? 'bg-success-light text-success-dark' :
                        order.status === 'SHIPPED' ? 'bg-info bg-opacity-15 text-info' :
                        order.status === 'CANCELLED' ? 'bg-danger bg-opacity-10 text-danger' :
                        'bg-warning bg-opacity-20 text-warning-dark'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select 
                        className="form-select form-select-sm rounded-pill text-center bg-light border-0 py-1"
                        value={order.status}
                        onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Management Modal */}
      {showProductModal && (
        <>
          <div className="modal-backdrop fade show position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-1040"></div>
          <div className="modal fade show d-block z-1050" tabIndex="-1" role="dialog" style={{ top: '10%' }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header bg-success-dark text-white border-0 rounded-top-4 p-4">
                  <h5 className="modal-title fw-bold">
                    {editingProduct ? 'Edit Product details' : 'Add New Product'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white text-reset border-0 bg-transparent" 
                    onClick={() => setShowProductModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleProductSubmit}>
                  <div className="modal-body p-4">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Product Name</label>
                        <input 
                          type="text" 
                          className="form-control rounded-pill bg-light border-0 py-2 px-3" 
                          required 
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Category</label>
                        <select 
                          className="form-select rounded-pill bg-light border-0 py-2 px-3 fw-semibold"
                          required
                          value={prodCategory}
                          onChange={(e) => setProdCategory(e.target.value)}
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Price (₹)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          className="form-control rounded-pill bg-light border-0 py-2 px-3" 
                          required 
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Stock</label>
                        <input 
                          type="number" 
                          className="form-control rounded-pill bg-light border-0 py-2 px-3" 
                          required 
                          value={prodStock}
                          onChange={(e) => setProdStock(e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Image URL</label>
                        <input 
                          type="url" 
                          className="form-control rounded-pill bg-light border-0 py-2 px-3" 
                          placeholder="https://image-url"
                          value={prodImg}
                          onChange={(e) => setProdImg(e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold text-muted fs-8 text-uppercase">Description</label>
                        <textarea 
                          className="form-control rounded-4 bg-light border-0 py-2 px-3" 
                          required 
                          rows="3" 
                          value={prodDesc}
                          onChange={(e) => setProdDesc(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 p-4 pt-0">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary rounded-pill px-4" 
                      onClick={() => setShowProductModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
