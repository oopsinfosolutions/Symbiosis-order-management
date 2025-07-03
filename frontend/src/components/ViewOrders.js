import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/ViewOrders.css";
import SideNav from "./SideNav";
import Nav from "./Admin/Nav";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20; // Orders per page
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("");

  const userType = sessionStorage.getItem("type");

  const getStatus = (orderDate, productStatus, stage, poDate) => {
    const now = dayjs().startOf("day");
    let dueDate = null;

    if (stage === 1) {
      dueDate = productStatus?.toLowerCase() === "repeat"
        ? dayjs(orderDate).add(2, "day").startOf("day")
        : dayjs(orderDate).add(5, "day").startOf("day");
    } else if (stage === 2 || stage === 3) {
      dueDate = productStatus?.toLowerCase() === "repeat"
        ? dayjs(orderDate).add(4, "day").startOf("day")
        : dayjs(orderDate).add(7, "day").startOf("day");
    } else if (stage === 4) {
      dueDate = poDate ? dayjs(poDate).add(20, "day").startOf("day") : null;
    } else if (stage === 5) {
      dueDate = dayjs(orderDate).add(40, "day").startOf("day");
    }

    if (!dueDate || !dueDate.isValid()) return { label: "No date", color: "bg-gray-400" };

    const diff = dueDate.diff(now, "day");

    if (diff > 1) return { label: `${diff} days left`, color: "bg-green-400" };
    if (diff === 1) return { label: "1 day left", color: "bg-yellow-300" };
    if (diff === 0) return { label: "Due today", color: "bg-yellow-400" };
    return { label: "Overdue", color: "bg-red-500" };
  };

  const handleEditOrder = (order) => {
    const { id, productStatus } = order;
    let nextStage;

    if (order.stage === 1 && productStatus === "repeat") {
      nextStage = 2;
    } else if (order.stage === 1 && productStatus === "new") {
      nextStage = 3;
    } else {
      nextStage = order.stage + 1; // fallback
    }

    axios
      .post("http://192.168.0.55:5000/api/orders/edit-status", {
        orderId: id,
        status: productStatus,
      })
      .then((res) => {
        console.log("Status update sent:", res.data);
        navigate(`/multiform/${id}?stage=${nextStage}`, { state: { order } });
      })
      .catch((err) => {
        console.error("Failed to send edit info:", err);
      });
  };

  useEffect(() => {
    axios
      .get(`http://192.168.0.55:5000/api/orders?page=${page}&limit=${limit}`)
      .then((res) => {
        const fetchedOrders = Array.isArray(res.data.orders) ? res.data.orders : [];
        setOrders(fetchedOrders);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
      });
  }, [page]);

  const nextPage = () => setPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="layout-container">
      <div className="sidebar-container">
        {userType === "admin" ? <Nav /> : <SideNav />}
      </div>
      <div className="form-section">
        <div className="orders-container">
          <h2>All Orders</h2>
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Brand</th>
                <th>Client</th>
                <th>Quantity</th>
                <th>MRP</th>
                <th>Stage</th>
                <th>
                  <div className="flex flex-col">
                    <span>Status</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="mt-1 text-sm border rounded px-1 py-1"
                    >
                      <option value="">All</option>
                      <option value="overdue">Overdue</option>
                      <option value="dueToday">Due Today</option>
                    </select>
                  </div>
                </th>
                <th>Status Label</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="10">No orders found.</td>
                </tr>
              ) : (
                orders
                  .filter((order) => {
                    const status = getStatus(order.date, order.productStatus, order.stage, order.poDate).label.toLowerCase();
                    if (statusFilter === "overdue") return status === "overdue";
                    if (statusFilter === "dueToday") return status === "due today";
                    return true;
                  })
                  .map((order) => {
                    const { label, color } = getStatus(order.date, order.productStatus, order.stage, order.poDate);
                    return (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.date?.split("T")[0]}</td>
                        <td>{order.brandName}</td>
                        <td>{order.clientName}</td>
                        <td>{order.qty}</td>
                        <td>{order.mrp}</td>
                        <td>{order.stage}</td>
                        <td>{order.productStatus}</td>
                        <td>
                          <span className={`text-white px-2 py-1 rounded text-sm ${color}`}>
                            {label}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="btn-edit"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={prevPage} disabled={page === 1}>
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={nextPage} disabled={page === totalPages}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrders;
