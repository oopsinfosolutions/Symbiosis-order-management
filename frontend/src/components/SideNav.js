import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";
// import ReactDOM from "react-dom";


const SideNav = () => {
  const { empId } = useAuth();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const stages = [
    { stage: 1, label: "Stage 1: Order Opening" },
    { stage: 2, label: "Stage 2: Packing Material Status" },
    { stage: 3, label: "Stage 3: Artwork Status" },
    { stage: 4, label: "Stage 4: Order Form" },
    { stage: 5, label: "Stage 5: Receipt Details" },
    { stage: 6, label: "Stage 6: Finished Product Dispatch" },
  ];

  const menuItems = [
    { name: "Add Product", link: "/multiform" },
    {
      name: "Your Orders",
      submenu: stages.map(({ stage, label }) => ({
        name: label,
        link: `/view-orders/${empId}?stage=${stage}`,
      })),
    },
    {
      name: "All Orders",
      submenu: stages.map(({ stage, label }) => ({
        name: label,
        link: `/view-orders?stage=${stage}`,
      })),
    },
    { name: "Logout", link: "#" },
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
            ) : (
              <a href={item.link} className="menu-link">
                <span>{item.name}</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideNav;
