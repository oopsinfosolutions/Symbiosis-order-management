import React from "react";
import "../../components/Sidebar.css";



const Nav = () => {
  const menuItems = [
    { name: "All Orders", link: "/view-all-orders" },
    { name: "Sections", link: "/sections" },
    { name: "Printers", link: "/printers" },

    { name: "Add Users", link: "/Addusers" },
    { name: "Update Users", link: "/Updateusers" },
    { name: "List Users", link: "/Listusers" },
    { name: "Delete Users", link: "/Deleteusers" },
    { name: "Form Progress", link: "/ConcernedPersonsList" },
  ];

  return (
    <div className="sidebar">
      <div className="logo">
        <h1>Admin panel</h1>
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

export default Nav;
