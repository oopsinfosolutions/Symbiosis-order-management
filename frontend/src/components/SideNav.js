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
  { stage: 2, status: "repeat", label: "Packing Material Status" },
  { stage: 3, status: "New", label: "Artwork Status" },
  { stage: 4, label: "Packing Material Order form" },
  { stage: 5, label: "Printers" },
  { stage: 6, label: "Receipt Details" },
  { stage: 7, label: "Sections" },
  { stage: 8, label: "Finished Product Dispatched" },
  { stage: 9, label: "Dispatched Orders" }

];

const menuItems = [
  { name: "Add Product", link: "/multiform" },
  {
    name: "My Orders",
    link: `/view-orders/${empId}`,
    submenu: stages.flatMap(({ stage, label, status }) => {
      // Stage 2: from stage 1 where status = repeat
      if (stage === 2) {
        return {
          name: label,
          link: `/view-orders/${empId}?stage=1&status=repeat`
        };
      }

      // Stage 3: from stage 1 where status = New
      if (stage === 3) {
        return {
          name: label,
          link: `/view-orders/${empId}?stage=1&status=New`
        };
      }

      // ✅ Stage 4: unified, fetch from both stage 2 and 3
      if (stage === 4) {
  return {
    name: label,
    link: `/view-orders/${empId}?fromStages=2,3`
  }}

      // Stage 5: from stage 4
      if (stage === 5) {
        return {
          name: label,
          link: `/printers?stage=4`
        };
      }

      // Stage 7: from stage 6
      if (stage === 7) {
        return {
          name: label,
          link: `/sections?stage=6`
        };
      }

      // Default: direct stage mapping
      return {
        name: label,
        link: `/view-orders/${empId}?stage=${stage-1}`
      };
    })
  },
  { name: "All Orders", link: `/view-orders` },
  { name: "Logout", action: handleLogout }
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
