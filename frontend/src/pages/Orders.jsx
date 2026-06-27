import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/order.service';
import authService from '../services/auth.service';

const Orders = ({ triggerError }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!authService.getCurrentUser()) {
        setLoading(false);
        return;
      }
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (err) {
        triggerError('Failed to fetch order history.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading orders...</span>
        </div>
      </div>
    );
  }

  if (!authService.getCurrentUser()) {
    return (
      <div className="container py-5 text-center">
        <div className="card border-0 shadow-sm rounded-4 p-5 max-w-500 mx-auto">
          <i className="bi bi-lock-fill text-success display-1 mb-4"></i>
          <h3>Please Log In</h3>
          <p className="text-muted mb-4">You must login to view your order history.</p>
          <Link to="/login" className="btn btn-success rounded-pill px-5 py-2 fw-bold">Log In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="fw-black text-success-dark mb-4">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <i className="bi bi-bag-x text-muted display-1 mb-4"></i>
          <h3>No Orders Placed Yet</h3>
          <p className="text-muted mb-4">You have not ordered any products from AgriMarket yet.</p>
          <Link to="/shop" className="btn btn-success rounded-pill px-5 py-2 fw-bold">Browse Shop</Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {orders.map((order) => (
            <div key={order.id} className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="bg-light p-4 d-flex justify-content-between align-items-center flex-wrap gap-2 border-bottom">
                <div>
                  <span className="text-muted fs-8 text-uppercase fw-semibold d-block">Order Placed</span>
                  <span className="fw-bold">{new Date(order.orderDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted fs-8 text-uppercase fw-semibold d-block">Total Paid</span>
                  <span className="fw-bold text-success-dark">₹{order.totalAmount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted fs-8 text-uppercase fw-semibold d-block">Order ID</span>
                  <span className="fw-bold">#{order.id}</span>
                </div>
                <div>
                  <span className="text-muted fs-8 text-uppercase fw-semibold d-block">Status</span>
                  <span className={`badge rounded-pill px-3 py-1.5 fs-8 text-uppercase ${
                    order.status === 'DELIVERED' ? 'bg-success-light text-success-dark' :
                    order.status === 'SHIPPED' ? 'bg-info bg-opacity-15 text-info' :
                    order.status === 'CANCELLED' ? 'bg-danger bg-opacity-10 text-danger' :
                    'bg-warning bg-opacity-20 text-warning-dark'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="card-body p-4">
                <div className="d-flex flex-column gap-3 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="d-flex align-items-center gap-3">
                      <img 
                        src={item.productImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=50'} 
                        alt={item.productName} 
                        style={{ width: '50px', height: '50px' }}
                        className="rounded object-fit-cover flex-shrink-0"
                      />
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-0 text-truncate">{item.productName}</h6>
                        <span className="text-muted fs-8">Quantity: {item.quantity}</span>
                      </div>
                      <span className="fw-bold text-success">₹{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-top pt-3 fs-7 text-muted">
                  <strong>Delivery To:</strong> {order.shippingAddress} (Ph: {order.phone})
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
