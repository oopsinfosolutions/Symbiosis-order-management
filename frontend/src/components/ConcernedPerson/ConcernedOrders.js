import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

function ConcernedOrders() {
  const { empId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/by-concerned/${empId}`);
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [empId]);

  const getStatus = (orderDate, productStatus) => {
    if (!orderDate) return { label: "No date", color: "bg-gray-400" };
  
    const now = dayjs().startOf("day");
    const daysToAdd = productStatus?.toLowerCase() === "new" ? 5 : 2;
    const dueDate = dayjs(orderDate).add(daysToAdd, "day").startOf("day");
    const diff = dueDate.diff(now, "day");
  
    if (diff > 1) return { label: `${diff} days left`, color: "bg-green-400" };
    if (diff === 1) return { label: "1 day left", color: "bg-yellow-300" };
    if (diff === 0) return { label: "Due today", color: "bg-yellow-400" };
    return { label: "Overdue", color: "bg-red-500" };
  };
  
  

  const handleView = (id) => {
    navigate(`/order-form/${id}`);
  };

  const filteredOrders = orders.filter((order) =>
    order.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 orders-container">
      <h2 className="text-xl font-bold mb-4">Your Orders</h2>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded w-full md:w-1/3"
        />
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center text-gray-500">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center text-gray-500">No orders found.</div>
      ) : (
        <table className="min-w-full bg-white border orders-table">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Order ID</th>
              <th className="py-2 px-4 border">Date</th>
              <th className="py-2 px-4 border">Product</th>
              <th className="py-2 px-4 border">Quantity</th>
              <th className="py-2 px-4 border">Rate</th>
              <th className="py-2 px-4 border">Amount</th>
              <th className="py-2 px-4 border">Product Status</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const { label, color } = getStatus(order.date, order.productStatus);
              return (
                <tr key={order._id}>
                  <td className="py-2 px-4 border">{order.id}</td>
                  <td className="py-2 px-4 border">{order.date?.split("T")[0]}</td>
                  <td className="py-2 px-4 border">{order.brandName}</td>
                  <td className="py-2 px-4 border">{order.qty}</td>
                  <td className="py-2 px-4 border">{order.rate}</td>
                  <td className="py-2 px-4 border">{order.amount}</td>
                  <td className="py-2 px-4 border">{order.productStatus}</td>
                  <td className="py-2 px-4 border">
                    <span className={`text-white px-2 py-1 rounded text-sm ${color}`}>{label}</span>
                  </td>
                  <td className="py-2 px-4 border">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      onClick={() => {
                        if (order._id) {
                          handleView(order._id);
                        } else {
                          console.warn("Missing order._id:", order);
                        }
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ConcernedOrders;
