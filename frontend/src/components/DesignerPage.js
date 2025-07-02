import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DesignerPage() {
  const [orders, setOrders] = useState([]);
  const [designerName, setDesignerName] = useState("YourDesignerName"); // Replace dynamically
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://192.168.29.222:5000/api/designer-orders/${designerName}`);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching designer orders:", error);
      }
    };

    fetchOrders();
  }, [designerName]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-6 sm:p-8">
        <h1 className="text-2xl font-semibold mb-6">Your Orders</h1>

        <input
          type="text"
          placeholder="Search by product..."
          className="w-full p-3 mb-6 border border-gray-300 rounded-md shadow-sm"
        />

        {orders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found.</p>
        ) : (
          <ul className="space-y-4">
            {currentOrders.map((order) => (
              <li key={order.id} className="p-4 border rounded-md shadow-sm bg-gray-50">
                <p><strong>Brand:</strong> {order.brandName}</p>
                <p><strong>Composition:</strong> {order.composition}</p>
                <p><strong>Pack Size:</strong> {order.packSize}</p>
                <p><strong>Qty:</strong> {order.qty}</p>
                <p><strong>Rate:</strong> {order.rate}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-between items-center mt-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded shadow text-sm ${
                currentPage === 1
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            <span className="text-sm">Page {currentPage} of {totalPages}</span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded shadow text-sm ${
                currentPage === totalPages
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </div>

          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow">
            Export to Excel
          </button>
        </div>
      </div>
    </div>
  );
}
