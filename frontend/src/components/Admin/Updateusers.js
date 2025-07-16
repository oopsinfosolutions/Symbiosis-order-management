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
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://192.168.0.60:5000/Listusers");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleEdit = (user) => {
    setEditingEmpId(user.Emp_id);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      Emp_id: user.Emp_id,
      phone: user.phone,
      password: "",
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("http://192.168.0.60:5000/updateusers", {
        ...formData,
        Emp_id: editingEmpId,
      });
      alert(response.data.message || "User updated successfully!");
      if (response.data.success) {
        const usersResponse = await axios.get("http://192.168.0.60:5000/Listusers");
        setUsers(usersResponse.data);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  return (
    <>
      <div className="layout-container">
        <div className="sidebar-container">
          <Nav />
        </div>

        <div className="content">
      
          <table className="user-table">
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
                      <button className="edit-btn" onClick={() => handleEdit(user)}>Edit</button>
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Update User</h2>
            <form onSubmit={handleUpdate}>
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
                placeholder="Employee ID"
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
              <div className="modal-buttons">
                <button type="submit">Update</button>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateUsers;
