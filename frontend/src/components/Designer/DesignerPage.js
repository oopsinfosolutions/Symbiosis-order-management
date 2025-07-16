import React, { useEffect, useState } from "react";
import axios from "axios";
import DNav from "./DNav";
import { Link, useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function DesignerPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeDesigner, setActiveDesigner] = useState("Home");
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const location = useLocation();
  const isAllPage = location.pathname.includes("/DesignerPage/all");

  const fetchOrders = async (designerFilter = null) => {
    setLoading(true);
    try {
      let params = {};

      if (isAllPage && designerFilter && designerFilter !== "Home") {
        params.designer = designerFilter;
      } else {
        const fullname = sessionStorage.getItem("fullname");
        params.fullname = fullname;
      }

      const response = await axios.get(`http://192.168.0.60:5000/api/designer-orders`, { params });
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

  useEffect(() => {
    if (isAllPage) {
      fetchOrders(activeDesigner);
    } else {
      fetchOrders();
    }
  }, []);

  const handleDesignerFilter = (designer) => {
    setActiveDesigner(designer);
    fetchOrders(designer);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleOrderAction = (order) => {
    axios
      .post("http://192.168.0.60:5000/api/orders/edit-status", {
        orderId: order.id,
        status: "New",
      })
      .then((res) => {
        navigate(`/add_artwork/${order.id}`, { state: { order } });
      })
      .catch((err) => {
        console.error("Failed to send edit info:", err);
      });
  };

  const exportToExcel = () => {
    const exportData = filteredOrders.map(order => ({
      "Order ID": order.id,
      "Date": order.date?.split("T")[0],
      "Brand Name": order.brandName,
      "Quantity": order.qty,
      "Rate": order.rate,
      "Amount": order.amount,
      "Product Status": order.productStatus,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `orders_${new Date().toISOString().slice(0, 10)}.xlsx`);

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
              <h2 className="page-title">Your Orders - Design Stage</h2>

              {loading ? (
                <div className="loading">Loading orders...</div>
              ) : (
                <>
                  {isAllPage && (
                    <div className="topnav">
                      {["Home", "Symbiosis", "Tejas", "NK"].map((designer) => (
                        <button
                          key={designer}
                          onClick={() => handleDesignerFilter(designer)}
                          className={`topnav-btn ${activeDesigner === designer ? "active" : ""}`}
                        >
                          {designer}
                        </button>
                      ))}
                    </div>
                  )}

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
                                  onClick={() => handleOrderAction(order)}
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
        .topnav {
          display: flex;
          background-color: #333;
          overflow: hidden;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .topnav-btn {
          border: none;
          outline: none;
          background-color: inherit;
          color: white;
          padding: 14px 20px;
          cursor: pointer;
          font-size: 17px;
          transition: background-color 0.3s;
        }

        .topnav-btn:hover {
          background-color: #575757;
        }

        .topnav-btn.active {
          background-color: #4CAF50;
          color: white;
        }

        .page-title {
          text-align: center;
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
        }
      `}</style>
    </>
  );
}
