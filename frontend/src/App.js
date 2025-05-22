import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OrderProcessForm from "./components/OrderProcessForm";
import ViewOrders from "./components/ViewOrders";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Addusers from './components/Admin/Addusers';
import Deleteusers from './components/Admin/Deleteusers';
import ListUsers from './components/Admin/Listusers';
import UpdateUsers from './components/Admin/Updateusers';
import AdminLogin from './components/AdminLogin';
import ConcernedPersonDashboard from "./components/ConcernedPerson/ConcernedPErsonDashboard";
import ConcernedOrders from "./components/ConcernedPerson/ConcernedOrders";
import ConcernedPersonsList from "./components/Admin/ConcernedPersonsList";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/multiform" element={<OrderProcessForm />} />
          <Route path="/view-orders" element={<ViewOrders />} />
          <Route path="/" element={<Signup />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Addusers" element={<Addusers />} />
          <Route path="/Deleteusers" element={<Deleteusers />} />
          <Route path="/Listusers" element={<ListUsers />} />
          <Route path="/Updateusers" element={<UpdateUsers />} />
          <Route path="/Adminlogin" element={<AdminLogin />} />
          <Route path="/view-orders/:empId" element={<ConcernedOrders />} />
          <Route path="/orders/:empId" element={<ConcernedOrders />} />
          <Route path="/employee-dashboard" element={<ConcernedPersonDashboard />} />
          <Route path="/ConcernedPersonsList" element={<ConcernedPersonsList />} />
          <Route path="/multiform/:id" element={<OrderProcessForm />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
