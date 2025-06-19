import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Sidebar.css";

const DNav = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();

  const empId = sessionStorage.getItem("id");

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    { name: "Add ArtWork", link: "/ADD_ArtWork" },
    { name: "My Orders", link: "/DesignerPage" },
    { name: "All Orders", link: "/DesignerPage/all" },
    { name: "Tejas", link: "/DesignerPage/" },
    { name: "NK", link: "/DesignerPage" },
    { name: "Logout", action: handleLogout }, // No link, uses action
  ];

  return (
    <div className="sidebar">
      <div className="logo">
        <h1>Designer panel</h1>
      </div>
      <ul className="menu">
        {menuItems.map((item, index) => (
          <li key={index} className="menu-item">
            {item.submenu ? (
              <>
                <div
                  className="menu-link submenu-toggle"
                  onClick={() => toggleMenu(item.name)}
                  style={{ cursor: "pointer" }}
                >
                  <span>{item.name}</span>
                  <span>{openMenu === item.name ? "▲" : "▼"}</span>
                </div>
                {openMenu === item.name && (
                  <ul className="submenu">
                    {item.submenu.map((subItem, subIndex) => (
                      <li key={subIndex} className="submenu-item">
                        <Link to={subItem.link} className="submenu-link">
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : item.action ? (
              <button
                onClick={item.action}
                className="menu-link text-left w-full bg-transparent border-none outline-none cursor-pointer"
                style={{ padding: 0 }}
              >
                <span>{item.name}</span>
              </button>
            ) : (
              <Link to={item.link} className="menu-link">
                <span>{item.name}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DNav;