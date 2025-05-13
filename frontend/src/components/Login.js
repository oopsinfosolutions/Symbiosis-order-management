import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [error, setError] = useState({});
  const [user, setUserState] = useState({ Emp_id: '', password: '' });
  const [signupMessage, setSignupMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserState({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const validForm = () => {
    const { Emp_id, password } = user;
    const formError = {};
    let isValid = true;

    if (!Emp_id) {
      formError.Emp_idError = 'Employee ID is required';
      isValid = false;
    }

    setError(formError);
    return isValid;
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const message = sessionStorage.getItem('signupMessage');
  if (message) {
    setSignupMessage(message);
    sessionStorage.removeItem('signupMessage');
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
        const response = await fetch('http://localhost:5000/Login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });

        if (!response.ok) {
          throw new Error('Failed to authenticate. Please try again.');
        }

        const json = await response.json();

        if (json.length === 0) {
          createNotification('warning', 'Invalid user, please try again');
        } else {
          const userName = json.fullName;

          if (userName) {
            sessionStorage.setItem("fullname", userName);
            sessionStorage.setItem("id", json.Emp_id);

            createNotification('success', `Welcome to your form`);
            const redirectPath = '/multiform';

            setTimeout(() => navigate(redirectPath), 1000);
          } else {
            createNotification('warning', 'Unexpected response structure');
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
        <h1>Log in to continue your learning journey</h1>
        <form id="loginForm" onSubmit={onLogin}>
          <label htmlFor="Emp_id">Employee ID</label>
          <input
            type="text"
            id="Emp_id"
            name="Emp_id"
            placeholder="Enter your Employee ID"
            value={user.Emp_id}
            onChange={handleChange}
            required
          />
          {error.Emp_idError && <p className="error">{error.Emp_idError}</p>}

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={user.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn primary">
            Login
          </button>
        </form>

        <div className="signup-link">
          <p>
            Don't have an account? <a href="/">Sign up</a>
          </p>
        </div>
        {signupMessage && (
  <div className="signup-message">
    <p>{signupMessage}</p>
  </div>
)}
        <div className="signup-link">
          <p>
            <a href="/Forgetpassword">Forget Password</a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
