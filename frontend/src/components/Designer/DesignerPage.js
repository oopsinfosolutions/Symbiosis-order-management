import React, { useEffect, useState } from "react";
import axios from "axios";
import DNav from "./DNav";
import { Link, useNavigate } from "react-router-dom";

export default function DesignerPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const fullname = sessionStorage.getItem("fullname");
        console.log(fullname)

const response = await axios.get(`http://localhost:5000/api/designer-orders`, {
  params: { fullname }
});


const fetchedOrders = Array.isArray(response.data.orders) ? response.data.orders : [];
setFilteredOrders(fetchedOrders);
setTotalPages(Math.ceil(fetchedOrders.length / itemsPerPage));

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

  const handleOrderAction = (orderId) => {
  let nextStage = 2;
   axios
      .post("http://localhost:5000/api/orders/edit-status", {
        orderId: orderId,
        status: "New",
      })
      .then((res) => {
        console.log("Status update sent:", res.data);
  
        // Pass order data using state
        navigate(`/multiform/${orderId}?stage=${nextStage}`);
      })
      .catch((err) => {
        console.error("Failed to send edit info:", err);
      });
};

 const exportToExcel = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/orders/export-orders',
      { orders: filteredOrders },
      {
        responseType: 'blob', // Important to handle binary file
      }
    );

    // Create a URL for the downloaded file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'designer_orders.xlsx'); // File name
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to export orders to Excel');
  }
};

  return (
    <>
      <div className="layout-container">
        <div className="sidebar-container">
          <DNav />
        </div>
        <div className="form-section">
          <div className="designer-container">
            <div className="designer-content">
              <h2>Your Orders - Design Stage</h2>

              {loading ? (
                <div className="loading">Loading orders...</div>
              ) : (
                <>
                  {filteredOrders.length === 0 ? (
                    <div className="no-orders">No orders found for design stage.</div>
                  ) : (
                    <div className="table-wrapper">
                      <table className="orders-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Brand</th>
                            <th>Client</th>
                            <th>Composition</th>
                            <th>Pack Size</th>
                            <th>Qty</th>
                            <th>MRP</th>
                            <th>Rate</th>
                            <th>Status</th>
                            <th>Stage</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentOrders.map((order) => (
                            <tr key={order.id}>
                              <td>{order.id}</td>
                              <td>{order.date?.split("T")[0]}</td>
                              <td>{order.brandName}</td>
                              <td>{order.clientName}</td>
                              <td>{order.composition || "N/A"}</td>
                              <td>{order.packSize || "N/A"}</td>
                              <td>{order.qty}</td>
                              <td>{order.mrp}</td>
                              <td>{order.rate || "N/A"}</td>
                              <td>
                                <span className="status-badge status-new">
                                  {order.productStatus}
                                </span>
                              </td>
                              <td>{order.stage}</td>
                              <td>
                                <button
                                  className="btn-design"
                                  onClick={() => handleOrderAction(order.id)}
                                >
                                  Start Design
                         </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

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

        .loading, .no-orders {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }

        .orders-table th, .orders-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: center;
        }

        .orders-table th {
          background-color: #f5f5f5;
          color: #333;
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

        .btn-design {
          background: #4caf50;
          color: white;
          border: none;
          padding: 8px 14px;
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

        @media (max-width: 768px) {
          .orders-table th, .orders-table td {
            font-size: 12px;
            padding: 6px;
          }

          .btn-design {
            padding: 6px 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
}
