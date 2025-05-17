import React from "react";
import "./Sidebar.css";



const SideNav = () => {
  const menuItems = [
    { name: "Add Form", link: "/multiform" },
    { name: "Your Orders", link: "/view-orders/:empId" },
    { name: "All Orders", link: "/view-orders" },
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
            <a href={item.link} className="menu-link">
              {item.icon}
              <span>{item.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideNav;
