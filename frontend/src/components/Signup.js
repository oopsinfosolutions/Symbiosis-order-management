import './Signup.css';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Signup() {
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
        const Emp_id = `${fullName.replace(/\s+/g, '_')}_${randomNum}`;

        const response = await axios.post('http://localhost:5000/checkEmpId', { Emp_id });
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

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const Emp_id = await generateEmpId(formData.fullName);
      const signupData = { ...formData, Emp_id };

      const response = await axios.post('http://localhost:5000/Signup', signupData);
      alert(response.data.message);
      if (response.data.success) {
        sessionStorage.setItem(
          'signupMessage',
          `Your Employee ID is ${Emp_id}. Please save it along with your password for future use.`
        );        
        navigate("/Login");
      }
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <center>
      <div className="signup-form2">
        <h1>Sign up Details</h1>
        <form id="signupForm2" onSubmit={handleSignup}>
          <label htmlFor="fullName">Full name</label>
          <input
            type="text"
            id="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn primary">Sign Up</button>
        </form>
        <div className="login-link">
          <p>
            Already have an account? <a href="/Login">Log in</a>
          </p>
        </div>
      </div>
    </center>
  );
}

export default Signup;
