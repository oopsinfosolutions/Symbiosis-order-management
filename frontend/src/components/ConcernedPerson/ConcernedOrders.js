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
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [sections, setSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const queryParams = new URLSearchParams(location.search);
  const stageParam = queryParams.get("fromStages") || queryParams.get("stage");

  let stageFilter;
  if (stageParam) {
    if (stageParam.includes(",")) {
      stageFilter = stageParam
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
    } else {
      const parsed = parseInt(stageParam, 10);
      stageFilter = isNaN(parsed) ? null : parsed;
    }
  } else {
    stageFilter = null;
  }

  const navStatus = queryParams.get("status");
  const currentPath = location.pathname;
  const category = currentPath.split("/")[1];

  const userType = sessionStorage.getItem("type");
  const empId = sessionStorage.getItem("id");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (category !== "view-all-orders") {
          const res = await axios.get(
            `http://192.168.0.55:5000/api/orders/by-concerned/${empId}?page=${page}&limit=${limit}`
          );
          const { orders: pagedOrders = [], totalPages: total = 1 } = res.data;
          setOrders(Array.isArray(pagedOrders) ? pagedOrders : []);
          setTotalPages(total);
        } else {
          const [pagedRes] = await Promise.all([
            axios.get(`http://192.168.0.55:5000/api/orders?page=${page}&limit=${limit}`),
          ]);
          setOrders(Array.isArray(pagedRes.data.orders) ? pagedRes.data.orders : []);
          setTotalPages(pagedRes.data.totalPages || 1);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchPrinters = async () => {
      try {
        const res = await axios.get("http://192.168.0.55:5000/api/printers");
        setPrinters(res.data);
      } catch (err) {
        console.error("Error fetching printers:", err);
      }
    };

    const fetchSections = async () => {
      try {
        const res = await axios.get("http://192.168.0.55:5000/api/sections");
        setSections(res.data);
      } catch (err) {
        console.error("Error fetching sections:", err);
      }
    };

    fetchOrders();
    if (category === "printers") fetchPrinters();
    if (category === "sections") fetchSections();
  }, [empId, category, page]);

  useEffect(() => {
    const fetchFilteredOrders = async () => {
      try {
        const response = await axios.get("http://192.168.0.55:5000/api/orders", {
          params: {
            empId,
            searchTerm,
            navStatus,
            stageFilter: Array.isArray(stageFilter)
              ? stageFilter.join(",")
              : stageFilter,
            statusFilter,
            category,
            selectedPrinter,
            selectedSections,
            page,
            limit,
          },
        });

        setOrders(Array.isArray(response.data.orders) ? response.data.orders : []);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        console.error("❌ Error fetching filtered orders:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchFilteredOrders();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, navStatus, stageFilter, statusFilter, category, selectedPrinter, selectedSections, page]);

  const getStatus = (orderDate, productStatus, stage, poDate) => {
    const now = dayjs().startOf("day");
    let dueDate = null;

    if (stage === 1) {
      dueDate =
        productStatus?.toLowerCase() === "repeat"
          ? dayjs(orderDate).add(2, "day").startOf("day")
          : dayjs(orderDate).add(5, "day").startOf("day");
    } else if (stage === 2 || stage === 3) {
      dueDate =
        productStatus?.toLowerCase() === "repeat"
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

  const exportToExcel = () => {
    const exportData = orders.map((order) => ({
      "Order ID": order.id,
      Date: order.date?.split("T")[0],
      "Brand Name": order.brandName,
      Quantity: order.qty,
      Rate: order.rate,
      Amount: order.amount,
      "Product Status": order.productStatus,
      Status: getStatus(order.date, order.productStatus, order.stage, order.poDate).label,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const nextPage = () => setPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="layout-container">
      <div className="sidebar-container">{userType === "admin" ? <Nav /> : <SideNav />}</div>
      <div className="form-section">
        <div className="p-4 orders-container">
          <h2 className="text-xl font-bold mb-4">Orders</h2>

          <input
            type="text"
            placeholder="Search by product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded w-full md:w-1/3 mb-4"
          />

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
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-500">No orders found.</div>
          ) : (
            <table className="min-w-full bg-white border orders-table">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">ID</th>
                  <th className="py-2 px-4 border">Date</th>
                  <th className="py-2 px-4 border">Brand</th>
                  <th className="py-2 px-4 border">Qty</th>
                  <th className="py-2 px-4 border">Rate</th>
                  <th className="py-2 px-4 border">Amount</th>
                  <th className="py-2 px-4 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const { label, color } = getStatus(order.date, order.productStatus, order.stage, order.poDate);
                  return (
                    <tr key={order.id}>
                      <td className="py-2 px-4 border">{order.id}</td>
                      <td className="py-2 px-4 border">{order.date?.split("T")[0]}</td>
                      <td className="py-2 px-4 border">{order.brandName}</td>
                      <td className="py-2 px-4 border">{order.qty}</td>
                      <td className="py-2 px-4 border">{order.rate}</td>
                      <td className="py-2 px-4 border">{order.amount}</td>
                      <td className="py-2 px-4 border">
                        <span className={`text-white px-2 py-1 rounded text-sm ${color}`}>{label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <div className="pagination mt-4 flex justify-center items-center gap-4">
            <button onClick={prevPage} disabled={page === 1} className="btn">Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={nextPage} disabled={page === totalPages} className="btn">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConcernedOrders;
