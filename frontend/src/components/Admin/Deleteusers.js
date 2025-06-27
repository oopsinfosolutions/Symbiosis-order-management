import React, { useState, useEffect } from "react";
import "./Listusers.css";
import axios from "axios";
import Nav from "./Nav";

const DeleteUsers = () => {
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://192.168.0.27:5000/Listusers");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (Emp_id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await axios.delete(`http://192.168.0.27:5000/deleteUsers/${Emp_id}`);
      alert(response.data.message || "User deleted successfully");

      setUsers((prevUsers) => prevUsers.filter((user) => user.Emp_id !== Emp_id));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  return (
    <>
     <div className="layout-container">
      <div className="sidebar-container">
        <Nav/>
      </div>
      <div className="form-section">
        <header>
          <h1>Delete Users</h1>
        </header>
        <main>
          <table className="user-table ">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Type</th>
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
                    <td>{user.type}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <button className="btn danger" onClick={() => handleDelete(user.Emp_id)}>
                        Delete
                      </button>
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
        </main>
      </div>
    </div>
    </>
  );
};

export default DeleteUsers;
