import React from "react";
import "../../components/Sidebar.css";
import { Link, useNavigate } from "react-router-dom";

const Nav = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    { name: "All Orders", link: "/view-all-orders" },
    { name: "Sections", link: "/sections" },
    { name: "Printers", link: "/printers" },
    { name: "Add Users", link: "/Addusers" },
    { name: "All Users", link: "/Updateusers" },
    { name: "Delete Users", link: "/Deleteusers" },
    { name: "Logout", action: handleLogout },
  ];

  return (
    <div className="sidebar">
      <div className="logo">
        <h1>Admin panel</h1>
      </div>
      <ul className="menu">
        {menuItems.map((item, index) => (
          <li key={index} className="menu-item">
            {item.link ? (
              <Link to={item.link} className="menu-link">
                <span>{item.name}</span>
              </Link>
            ) : (
              <button onClick={item.action} className="menu-link logout-button">
                <span>{item.name}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Nav;
