import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/ViewOrders.css";
import SideNav from "./SideNav";
import Nav from "./Admin/Nav";
import { useNavigate } from "react-router-dom";

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  // const { empId } = useParams();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20; // Orders per page
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("");

  const userType = sessionStorage.getItem('type');

  const handleEditOrder = (order) => {
    const { id, productStatus } = order;
  
    let nextStage;
    console.log(order)
  
    if (order.stage == 1 && productStatus === "repeat") {
      nextStage = 2;
    } else if (order.stage == 1 && productStatus === "new") {
      nextStage = 3;
    } else {
      nextStage = 1; // fallback
    }

    nextStage = order.stage + 1;
  
    // Optional: backend sync
    axios
      .post("http://192.168.0.55:5000/api/orders/edit-status", {
        orderId: id,
        status: productStatus,
      })
      .then((res) => {
        console.log("Status update sent:", res.data);
  
        // Pass order data using state
        navigate(`/multiform/${id}?stage=${nextStage}`, { state: { order } });
      })
      .catch((err) => {
        console.error("Failed to send edit info:", err);
      });
  };
  
//   const filteredOrders = orders
//   .filter(order =>
//     [order.brandName, order.date, order.qty, order.rate, order.amount, order.productStatus]
//       .some(field =>
//         field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
//       )
//   )
//   .filter(order =>
//     !isNaN(stageFilter) ? order.stage === stageFilter : true
//   ).filter(order => {
//   const status = getStatus(order.date, order.productStatus, order.stage, order.poDate).label.toLowerCase();
//   if (statusFilter === "overdue") return status === "overdue";
//   if (statusFilter === "dueToday") return status === "due today";
//   return true;
// });


  useEffect(() => {
    
    axios
      .get(`http://192.168.0.55:5000/api/orders?page=${page}&limit=${limit}`)
      .then((res) => {
        console.log("API response:", res.data);
        
        const fetchedOrders = Array.isArray(res.data.orders) ? res.data.orders : [];
        setOrders(fetchedOrders);
        
        const pages = res.data.totalPages || 1;
        setTotalPages(pages);
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
        {userType === "admin" ? <Nav /> :
         <SideNav />
          }
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
            {/* <th>Status</th> */}
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr><td colSpan="8">No orders found.</td></tr>
          ) : (
            orders.map((order) => (
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
                    {/* <button
                    onClick={() => navigate(`/multiform/${order.id}`)}
                    className="btn-view"
                    >
                        View
                    </button>{" "} */}
                        <button
                            onClick={() => handleEditOrder(order)}
                            className="btn-edit"
                        >
                            Edit
                        </button>
                    </td>
                </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={prevPage} disabled={page === 1}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={nextPage} disabled={page === totalPages}> Next</button>
      </div>
    </div>
    </div>
    </div>
  );
};

export default ViewOrders;
