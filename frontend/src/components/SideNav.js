import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const SideNav = () => {
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

  const stages = [
    { stage: 1, label: "Stage 1: Order Opening" },
    { stage: 2, label: "Stage 2: Packing Material Status" },
    { stage: 3, label: "Stage 3: Artwork Status" },
    { stage: 4, label: "Stage 4: Order Form" },
    { stage: 5, label: "Stage 5: Receipt Details" },
  ];

  const menuItems = [
    { name: "Add Product", link: "/multiform" },
    {
      name: "My Orders",
      link: `/view-orders/${empId}`,
      submenu: stages.map(({ stage, label }) => ({
        name: label,
        link: `/view-orders/${empId}?stage=${stage}`,
      })),
    },
    { name: "Printers", link: "/printers" },
    { name: "Sections", link: "/sections" },
    { name: "All Orders", link: `/view-orders` },
    { name: "Logout", action: handleLogout }, // No link, uses action
  ];

  return (
    <div className="sidebar">
      <div className="logo">
        <h1>Emp panel</h1>
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

export default SideNav;
