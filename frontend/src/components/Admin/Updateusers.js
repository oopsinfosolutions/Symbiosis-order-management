import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Signup.css";
import "./Listusers.css";
import Nav from "./Nav";

const UpdateUsers = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    Emp_id: "",
    phone: "",
    password: "",
  });
  const [editingEmpId, setEditingEmpId] = useState(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/Listusers");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Handle user update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingEmpId) {
      alert("Please select a user to update.");
      return;
    }

    try {
      const response = await axios.put("http://localhost:5000/updateusers", {
        ...formData,
        Emp_id: editingEmpId,
      });
      alert(response.data.message || "User updated successfully!");
      if (response.data.success) {
        // Refresh user list
        const usersResponse = await axios.get("http://localhost:5000/Listusers");
        setUsers(usersResponse.data);
        setEditingEmpId(null);
        setFormData({
          fullName: "",
          email: "",
          Emp_id: "",
          phone: "",
          password: "",
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  // Handle edit button click
  const handleEdit = (user) => {
    setEditingEmpId(user.Emp_id);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      Emp_id: user.Emp_id,
      phone: user.phone,
      password: "",
    });
  };

  return (
    <>
    <div className="layout-container">
      <div className="sidebar-container">
        <Nav/>
      </div>
      <div className="form-section">
      <form onSubmit={handleUpdate}>
        <header>
        <h1>Update User</h1>
      </header>
        <input
          type="text"
          id="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          required
        />
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="text"
          id="Emp_id"
          value={formData.Emp_id}
          readOnly
          disabled
          placeholder="Employee ID (Uneditable)"
        />
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          required
        />
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password (Optional)"
        />
        <button type="submit">Update User</button>
      </form>
      </div>
      </div>
      <div className="content">
        <center>
      <h2>User List</h2>
      </center>
      <table className="user-table ">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.Emp_id}>
                <td>{user.Emp_id}</td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <button onClick={() => handleEdit(user)}>Edit</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </>
  );
};

export default UpdateUsers;
