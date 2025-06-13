import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import SideNav from "../SideNav";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Nav from "../Admin/Nav";

function ConcernedOrders() {
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const queryParams = new URLSearchParams(location.search);
  const stageParam = queryParams.get("fromStages") || queryParams.get("stage");
const stageFilter = stageParam?.includes(",")
  ? stageParam.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
  : parseInt(stageParam, 10);
  const navStatus = queryParams.get("status");
  const currentPath = location.pathname;
  const category = currentPath.split("/")[1];

  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState("");

  const [sections, setSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState("");
  const [allOrders, setAllOrders] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20; // Orders per page


  console.log(category)
  console.log("Status:", navStatus); //return new or repeat


  const userType = sessionStorage.getItem('type');
  const empId = sessionStorage.getItem('id');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (empId !== 'admin') {
          const res = await axios.get(`http://localhost:5000/api/orders/by-concerned/${empId}`);
          console.log("Concerned person API response:", res.data);
          setOrders(Array.isArray(res.data) ? res.data : []);  // 🟢 For non-admin
          setTotalPages(1); // Optional: if paginating, keep it to 1
        } else {
          const [pagedRes, allRes] = await Promise.all([
            axios.get(`http://localhost:5000/api/orders?page=${page}&limit=${limit}`),
            axios.get("http://localhost:5000/api/orders")  // Get full list (for filter use only)
          ]);

          setOrders(Array.isArray(pagedRes.data.orders) ? pagedRes.data.orders : []);
          setAllOrders(Array.isArray(allRes.data.orders) ? allRes.data.orders : []);

          const pages = pagedRes.data.totalPages || 1;
          setTotalPages(pages);

        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };


    const fetchPrinters = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/printers");
        setPrinters(res.data);
        console.log(res.data)
      } catch (err) {
        console.error("Error fetching printers:", err);
      }
    };

    const fetchSections = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/sections");
        setSections(res.data);
        console.log(res.data)
      } catch (err) {
        console.error("Error fetching sections:", err);
      }
    };

    fetchOrders();

    if (category === "printers") {
      fetchPrinters();
    } else if (category === "sections") {
      fetchSections();
    }



  }, [empId, category, page]);


  const getStatus = (orderDate, productStatus, stage, poDate) => {
    const now = dayjs().startOf("day");
    let dueDate = null;

    if (stage === 1) {
      // Packing Material Status
      dueDate = productStatus?.toLowerCase() === "repeat"
        ? dayjs(orderDate).add(2, "day").startOf("day")
        : dayjs(orderDate).add(5, "day").startOf("day"); // No due date for new here?

    } else if (stage === 2 || stage === 3) {
      // Artwork Status
      dueDate = productStatus?.toLowerCase() === "repeat"
        ? dayjs(orderDate).add(4, "day").startOf("day")
        : dayjs(orderDate).add(7, "day").startOf("day");

    } else if (stage === 4) {
      // Packing Material Order Form
      
      dueDate = poDate ? dayjs(poDate).add(20, "day").startOf("day") : null;


    } else if (stage === 5) {
      // Printers
      dueDate = null;

    } else if (stage === 6) {
      // Receipt details
      dueDate = dayjs(orderDate).add(40, "day").startOf("day");

    } else if (stage === 7) {
      // Sections
      dueDate = null

    } else if (stage === 8) {
      // Finished Product Dispatch
      dueDate = null;
    }


    if (!dueDate || !dueDate.isValid()) return { label: "No date", color: "bg-gray-400" };

    const diff = dueDate.diff(now, "day");

    if (diff > 1) return { label: `${diff} days left`, color: "bg-green-400" };
    if (diff === 1) return { label: "1 day left", color: "bg-yellow-300" };
    if (diff === 0) return { label: "Due today", color: "bg-yellow-400" };
    return { label: "Overdue", color: "bg-red-500" };
  };

  const handleView = (id, currentStage) => {
    const nextStage = currentStage + 1;
    navigate(`/multiform/${id}?stage=${nextStage}`);
  };
  console.log(orders)

  const handleComplete = async (order) => {
    const updatedStage = category === 'printers' ? 5 : 7;

    try {
      const res = await axios.put(`http://localhost:5000/api/orders/update-stage`, {
        orderId: order.id,
        newStage: updatedStage,
      });

      console.log("Order updated successfully:", res.data);

      // Update local state to reflect change
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === order.id ? { ...o, stage: updatedStage } : o
        )
      );
      navigate(`/view-orders/${empId}?stage=${updatedStage}`, { state: { order } });

      // Optionally show a success toast/snackbar
    } catch (err) {
      console.error("Error updating order stage:", err);
      // Optionally show error toast
    }
  };


  const handleEditOrder = (order) => {
    const { id, productStatus } = order;

    let nextStage;
    console.log(order)

    if (order.stage === 1 && productStatus === "repeat") {
      nextStage = 2; // Packing Material Status
    } else if (order.stage === 1 && productStatus === "new") {
      nextStage = 3; // Artwork Status
    } else if (order.stage === 2 || order.stage === 3) {
      nextStage = 4; // Packing Material Order Form
    } else if (order.stage === 4) {
      nextStage = 5; // Printers
    } else if (order.stage === 5) {
      nextStage = 6; // Receipt Details
    } else if (order.stage === 6) {
      nextStage = 7; // Sections
    } else if (order.stage === 7) {
      nextStage = 8; // Finished Product Dispatch
    } else if (order.stage === 8) {
      nextStage = 5; // Dispatched orders
    } else {
      nextStage = order.stage + 1; // fallback
    }


    // Optional: backend sync
    axios
      .post("http://localhost:5000/api/orders/edit-status", {
        orderId: id,
        status: productStatus,
      })
      .then((res) => {
        console.log("Status update sent:", res.data);
        if (order.stage === 2 || order.stage === 3) {
          navigate(`/multiform/${id}?stage=${3}`, { state: { order } });
        } else if (order.stage === 4) {
          navigate(`/printers`, { state: { order } });
        } else if (order.stage === 5) {
          navigate(`/multiform/${id}?stage=${4}`, { state: { order } });
        } else if (order.stage === 6) {
          navigate(`/sections`, { state: { order } });
        } else if (order.stage === 7) {
          navigate(`/multiform/${id}?stage=${5}`, { state: { order } });
        } else {
          navigate(`/multiform/${id}?stage=${nextStage}`, { state: { order } });
        }
        // Pass order data using state
        // navigate(`/multiform/${id}?stage=${nextStage}`, { state: { order } });
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
    ).filter(order =>
      navStatus ? order.productStatus?.toLowerCase() === navStatus.toLowerCase() : true
    ).filter(order => {
      if (Array.isArray(stageFilter)) {
        return stageFilter.includes(order.stage);
      } else if (!isNaN(stageFilter)) {
        return order.stage === stageFilter;
      }
      return true;
    })
    .filter(order => {
      console.log(statusFilter)
      const status = getStatus(order.date, order.productStatus, order.stage, order.poDate).label.toLowerCase();
      if (statusFilter === "overdue") return status === "overdue";
      if (statusFilter === "dueToday") return status === "due today";
      return true;
    }).filter(order =>
      category === "printers" && selectedPrinter
        ? (
          order.innerPrinter === selectedPrinter ||
          order.outerPrinter === selectedPrinter ||
          order.foilTubePrinter === selectedPrinter ||
          order.additionalPrinter === selectedPrinter
        )
        : true
    ).filter(order =>
      category === "sections" && selectedSections
        ? order.section === selectedSections
        : true
    );

  const exportToExcel = () => {
    const exportData = filteredOrders.map(order => ({
      "Order ID": order.id,
      "Date": order.date?.split("T")[0],
      "Brand Name": order.brandName,
      "Quantity": order.qty,
      "Rate": order.rate,
      "Amount": order.amount,
      "Product Status": order.productStatus,
      "Status": getStatus(order.date, order.productStatus, order.stage, order.poDate).label
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

  const getStageTitle = () => {
    console.log(stageFilter)
   const status = navStatus?.toLowerCase();

  // Handle multiple stages like [2, 3]
  if (Array.isArray(stageFilter)) {
    if (stageFilter.includes(2) && stageFilter.includes(3)) {
      if (status === "repeat") return "Packing Material Order Form (4 days)";
      if (status === "new") return "Packing Material Order Form (7 days)";
      return "Packing Material Order Form";
    }
    return ""; // Or handle other combinations
  }

  switch (stageFilter) {
    case 1:
      return navStatus === "repeat" ? "Packing Material Status (2 days)" : "Artwork Status (5 days)";
    case 2:
    case 3:
      return "Packing Material Order Form (4 days)";
      // if (navStatus === "new") return "Packing Material Order Form (7 days)";
      // return "Packing Material Order Form";
    case 4:
      return "Printers (20 days from PO)";
    case 5:
      return "Receipt Details";
    case 6:
      return "Sections (40 days)";
    case 7:
      return "Finished Product Dispatch";
    case 8:
      return "Dispatched Products";
    default:
      return "";
  }
};


  const nextPage = () => setPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="layout-container">
      <div className="sidebar-container">
        {/* <SideNav /> */}
        {userType === 'admin' ? <Nav /> : <SideNav />}
      </div>
      <div className="form-section">
        <div className="p-4 orders-container">
          <h2 className="text-xl font-bold mb-4">
            {getStageTitle()}
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
          {category === "printers" && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Filter by Printer:</label>
              <select
                value={selectedPrinter}
                onChange={(e) => setSelectedPrinter(e.target.value)}
                className="px-3 py-2 border rounded w-full md:w-1/3"
              >
                <option value="">All Printers</option>
                {printers.map((printer) => (
                  <option key={printer._id} value={printer.name}>
                    {printer.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {category === "sections" && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Filter by Sections:</label>
              <select
                value={selectedSections}
                onChange={(e) => setSelectedSections(e.target.value)}
                className="px-3 py-2 border rounded w-full md:w-1/3"
              >
                <option value="">All Sections</option>
                {sections.map((section) => (
                  <option key={section._id} value={section.name}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end mb-4">
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Export to Excel
            </button>
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
                  <th className="py-2 px-4 border">Product Name</th>

                  {category === "printers" && (
                    <th className="py-2 px-4 border">
                      Type
                    </th>
                  )}

                  <th className="py-2 px-4 border">Quantity</th>
                  <th className="py-2 px-4 border">Rate</th>
                  <th className="py-2 px-4 border">Amount</th>
                  {/* <th className="py-2 px-4 border">Product Status</th> */}
                  <th className="py-2 px-4 border">Stage</th>
                  <th className="py-2 px-4 border">Status</th>
                  <th className="py-2 px-4 border">
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
                  {stageFilter !== 8 && <th className="py-2 px-4 border">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  console.log(order)
                  const { label, color } = getStatus(order.date, order.productStatus, order.stage, order.poDate);
                  return (
                    <tr key={order._id}>
                      <td className="py-2 px-4 border">{order.id}</td>
                      <td className="py-2 px-4 border">{order.date?.split("T")[0]}</td>
                      <td className="py-2 px-4 border">{order.brandName}</td>
                      {category === "printers" && (
                        <td className="py-2 px-4 border">
                          {order.innerPrinter === selectedPrinter
                            ? "Inner"
                            : order.outerPrinter === selectedPrinter
                              ? "Outer"
                              : order.foilTubePrinter === selectedPrinter
                                ? "Foil/Tube"
                                : order.additionalPrinter === selectedPrinter
                                  ? "Additional"
                                  : "—"}
                        </td>
                      )}

                      <td className="py-2 px-4 border">{order.qty}</td>
                      <td className="py-2 px-4 border">{order.rate}</td>
                      <td className="py-2 px-4 border">{order.amount}</td>
                      <td className="py-2 px-4 border">{order.stage}</td>
                      <td className="py-2 px-4 border">{order.productStatus}</td>
                      <td className="py-2 px-4 border">
                        <span className={`text-white px-2 py-1 rounded text-sm ${color}`}>
                          {label}
                        </span>
                      </td>
                      {order.stage !== 8 && <td className="py-2 px-4 border">
                        {category}
                        {(category === 'printers' || category === 'sections') ? (
                          <button
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            onClick={() => handleComplete(order)}
                          >
                            Complete
                          </button>
                        ) : (
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() => handleEditOrder(order)}
                          >
                            View
                          </button>
                        )}
                      </td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="pagination">
          <button onClick={prevPage} disabled={page === 1}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={nextPage} disabled={page === totalPages}> Next</button>
        </div>
      </div>

    </div>
  );
}

export default ConcernedOrders;
