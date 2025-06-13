import React, { useState, useEffect } from "react";
import "./Listusers.css";
import axios from "axios";
import Nav from "./Nav";

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/Listusers"); // Backend route for listing users
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <>
    <div className="layout-container">
      <div className="sidebar-container">
        <Nav/>
      </div>
      <div className="form-section">
        <header>
          <h1>User List</h1>
        </header>
        <main>
          <table className="user-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Type</th>
                <th>Email</th>
                <th>Phone</th>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No users found.</td>
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

export default ListUsers;
