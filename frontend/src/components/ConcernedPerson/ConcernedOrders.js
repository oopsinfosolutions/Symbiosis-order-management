import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import SideNav from "../SideNav";

function ConcernedOrders() {
  const { empId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const queryParams = new URLSearchParams(location.search);
  const stageFilter = parseInt(queryParams.get("stage"), 7); // Will be NaN if not provided

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

  const getStatus = (orderDate, productStatus, stage, poDate) => {
    if (!orderDate) return { label: "No date", color: "bg-gray-400" };

    const now = dayjs().startOf("day");
    var daysToAdd = 0;
    if(stage == 1) {
      daysToAdd = productStatus?.toLowerCase() === "new" ? 5 : 2;
        }    else if(stage == 2 || stage == 3) {
      daysToAdd = productStatus?.toLowerCase() === "new" ? 7 : 4;
    } else if(stage == 4){
      daysToAdd = 20
    } else {
      daysToAdd = 40
    }
    const dueDate = dayjs(orderDate).add(daysToAdd, "day").startOf("day");
    const diff = dueDate.diff(now, "day");

    if (diff > 1) return { label: `${diff} days left`, color: "bg-green-400" };
    if (diff === 1) return { label: "1 day left", color: "bg-yellow-300" };
    if (diff === 0) return { label: "Due today", color: "bg-yellow-400" };
    return { label: "Overdue", color: "bg-red-500" };
  };

  // const handleView = (id, currentStage) => {
  //   const nextStage = currentStage + 1;
  //   navigate(`/multiform/${id}?stage=${nextStage}`);
  // };
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
      .post("http://localhost:5000/api/orders/edit-status", {
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
    

  const filteredOrders = orders
  .filter(order =>
    [order.brandName, order.date, order.qty, order.rate, order.amount, order.productStatus]
      .some(field =>
        field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
  )
  .filter(order =>
    !isNaN(stageFilter) ? order.stage === stageFilter : true
  );


  return (
    <div className="layout-container">
      <div className="sidebar-container">
        <SideNav />
      </div>
      <div className="form-section">
        <div className="p-4 orders-container">
          <h2 className="text-xl font-bold mb-4">
            Your Orders {stageFilter ? `(Stage ${stageFilter})` : ""}
          </h2>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded w-full md:w-1/3"
            />
          </div>

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
                  const { label, color } = getStatus(order.date, order.productStatus, order.stage, order.poDate);
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
                        <span className={`text-white px-2 py-1 rounded text-sm ${color}`}>
                          {label}
                        </span>
                      </td> 
                      <td className="py-2 px-4 border">
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          onClick={() => handleEditOrder(order       )}
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
      </div>
    </div>
  );
}

export default ConcernedOrders;
