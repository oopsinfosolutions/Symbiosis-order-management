import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const AdminLogin = () => {
  const [error, setError] = useState({});
  const [admin, setAdminState] = useState({ email: '', password: '' });
  const [loginMessage, setLoginMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setAdminState({
      ...admin,
      [e.target.name]: e.target.value,
    });
  };

  const validForm = () => {
    const { email, password } = admin;
    const formError = {};
    let isValid = true;

    if (!email) {
      formError.emailError = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formError.emailError = 'Enter a valid email address';
      isValid = false;
    }

    if (!password) {
      formError.passwordError = 'Password is required';
      isValid = false;
    }

    setError(formError);
    return isValid;
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const message = sessionStorage.getItem('loginMessage');
    if (message) {
      setLoginMessage(message);
      sessionStorage.removeItem('loginMessage');
    }
  }, []);

  const createNotification = (type, message) => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  const onLogin = async (e) => {
    e.preventDefault();

    const isValid = validForm();
    if (isValid) {
      try {
        const response = await fetch('http://localhost:5000/AdminLogin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(admin),
        });

        if (!response.ok) {
          throw new Error('Authentication failed. Please try again.');
        }

        const json = await response.json();

        if (!json || json.type !== 'admin') {
          createNotification('warning', 'Access restricted to admins only.');
        } else {
          const adminName = json.fullName;

          if (adminName) {
            sessionStorage.setItem("fullname", adminName);
            sessionStorage.setItem("email", json.email);
            sessionStorage.setItem("type", json.type);
            sessionStorage.setItem("id", "admin")

            createNotification('success', `Welcome, Admin ${adminName}`);
            const redirectPath = '/Addusers';

            setTimeout(() => navigate(redirectPath), 1000);
          } else {
            createNotification('warning', 'Unexpected response structure.');
          }
        }
      } catch (err) {
        console.error('Login error:', err);
        createNotification('error', 'Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Admin Login</h1>
        <form id="LoginForm" onSubmit={onLogin}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={admin.email}
            onChange={handleChange}
            required
          />
          {error.emailError && <p className="error">{error.emailError}</p>}

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={admin.password}
            onChange={handleChange}
            required
          />
          {error.passwordError && <p className="error">{error.passwordError}</p>}

          <button type="submit" className="btn primary">
            Login
          </button>
        </form>

        {loginMessage && (
          <div className="login-message">
            <p>{loginMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
