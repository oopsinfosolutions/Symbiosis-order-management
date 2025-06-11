import React, { useEffect, useState } from "react";
import axios from "axios";
import DNav from "./DNav";

export default function DesignerPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;
  const limit = 20; // Orders per page from API

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Fetch all orders from the ViewOrders endpoint
        const response = await axios.get(`http://localhost:5000/api/orders?page=1&limit=1000`); // Get all orders
        
        const fetchedOrders = Array.isArray(response.data.orders) ? response.data.orders : [];
        
        // Filter orders for stage 2 and productStatus "new"
        const filtered = fetchedOrders.filter(order => 
          order.stage === 2 && order.productStatus === "new"
        );
        
        setOrders(fetchedOrders);
        setFilteredOrders(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        
        console.log("Filtered orders for designer:", filtered);
      } catch (error) {
        console.error("Error fetching designer orders:", error);
        setFilteredOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleOrderAction = async (orderId) => {
    try {
      // You can add any action logic here for the designer
      console.log("Processing order:", orderId);
      // For example, update order status or navigate to design form
    } catch (error) {
      console.error("Error processing order:", error);
    }
  };

  const exportToExcel = () => {
    // Export functionality
    console.log("Exporting to Excel...");
    // You can implement Excel export logic here
  };

  return (
    <>
    <div className="layout-container">
          <div className="sidebar-container">
            <DNav/>
          </div>
          <div className="form-section">
      <div className="designer-container">
        <div className="designer-content">
          <h2>Your Orders - Design Stage</h2>
          <p className="order-info">
            Showing orders at Stage 2 with "New" product status
          </p>
          
          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : (
            <>
              <div className="orders-list">
                {filteredOrders.length === 0 ? (
                  <div className="no-orders">
                    No orders found for design stage.
                  </div>
                ) : (
                  <div className="orders-grid">
                    {currentOrders.map((order) => (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <h3>Order #{order.id}</h3>
                          <span className="order-date">
                            {order.date?.split("T")[0]}
                          </span>
                        </div>
                        <div className="order-details">
                          <p><strong>Brand:</strong> {order.brandName}</p>
                          <p><strong>Client:</strong> {order.clientName}</p>
                          <p><strong>Composition:</strong> {order.composition || 'N/A'}</p>
                          <p><strong>Pack Size:</strong> {order.packSize || 'N/A'}</p>
                          <p><strong>Qty:</strong> {order.qty}</p>
                          <p><strong>MRP:</strong> {order.mrp}</p>
                          <p><strong>Rate:</strong> {order.rate || 'N/A'}</p>
                          <p><strong>Status:</strong> 
                            <span className="status-badge status-new">
                              {order.productStatus}
                            </span>
                          </p>
                          <p><strong>Stage:</strong> {order.stage}</p>
                        </div>
                        <div className="order-actions">
                          <button 
                            className="btn-design"
                            onClick={() => handleOrderAction(order.id)}
                          >
                            Start Design
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {filteredOrders.length > 0 && (
                <div className="pagination">
                  <button 
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}

              <div className="export-section">
                <button 
                  onClick={exportToExcel}
                  className="btn-export"
                  disabled={filteredOrders.length === 0}
                >
                  Export to Excel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
      </div>

      <style jsx>{`
        .designer-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .designer-content {
          background: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .designer-content h2 {
          color: #333;
          margin-bottom: 8px;
        }

        .order-info {
          color: #666;
          margin-bottom: 24px;
          font-size: 14px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .no-orders {
          text-align: center;
          padding: 40px;
          color: #666;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .orders-grid {
          display: grid;
          gap: 20px;
          margin-bottom: 24px;
        }

        .order-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          background: #fafafa;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e0e0e0;
        }

        .order-header h3 {
          margin: 0;
          color: #333;
        }

        .order-date {
          color: #666;
          font-size: 14px;
        }

        .order-details {
          margin-bottom: 16px;
        }

        .order-details p {
          margin: 8px 0;
          color: #555;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .status-new {
          background: #e3f2fd;
          color: #1976d2;
        }

        .order-actions {
          text-align: right;
        }

        .btn-design {
          background: #4caf50;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .btn-design:hover {
          background: #45a049;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin: 24px 0;
        }

        .pagination-btn {
          background: #2196f3;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .pagination-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #1976d2;
        }

        .pagination-info {
          color: #666;
          font-weight: bold;
        }

        .export-section {
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e0e0e0;
        }

        .btn-export {
          background: #ff9800;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .btn-export:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .btn-export:hover:not(:disabled) {
          background: #f57c00;
        }
      `}</style>
    </>
  );
}