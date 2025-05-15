import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Header.css";
const Header = () => {
  const location = useLocation();

  return (
    <nav className="header-nav">
      <Link
        to="/order-form"
        className={location.pathname === "/multiform" ? "active" : ""}
      >
        Order Form
      </Link>
      <Link
        to="/view-orders"
        className={location.pathname === "/view-orders/:empId" ? "active" : ""}
      >
        View Orders
      </Link>
    </nav>
  );
};

export default Header;
