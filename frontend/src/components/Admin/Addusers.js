import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Signup.css";
import Nav from "./Nav";

function Addusers() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const generateEmpId = async (fullName) => {
    try {
      while (true) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const Emp_id = `${fullName.replace(/\s+/g, "_")}_${randomNum}`;

        const response = await axios.post("http://localhost:5000/checkEmpId", { Emp_id });
        if (response.data.available) {
          return Emp_id;
        }
      }
    } catch (error) {
      console.error("Error checking Emp_id availability:", error.response?.data || error.message);
      alert("Error verifying Emp_id. Please try again.");
      throw error;
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const Emp_id = await generateEmpId(formData.fullName);
      const userData = { ...formData, Emp_id };

      const response = await axios.post("http://localhost:5000/Signup", userData);
      alert(response.data.message);
      if (response.data.success) {
        navigate("/Listusers");
      }
    } catch (error) {
      console.error("Error adding user:", error.response?.data || error.message);
      alert("Adding user failed. Please try again.");
    }
  };

  return (
    <>
    <div className="layout-container">
      <div className="sidebar-container">
        <Nav/>
      </div>
      <div className="form-section">
        <h1>Add User</h1>
        <form id="addUserForm" onSubmit={handleAddUser}>
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            placeholder="Enter full name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn primary">Add User</button>
        </form>
      </div>
    </div>
    </>
  );
}

export default Addusers;
