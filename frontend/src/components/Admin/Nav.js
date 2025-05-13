import React from 'react';
import "./Nav.css";

const Nav = () => {
  return (
    <div className="nav-wrapper">
      <section>
        <nav id="main-nav">
          <ul className="nav-menu">
            <li><a href='/Addusers' className="nav-link">Add Users</a></li>
            <li><a href='/Updateusers' className="nav-link">Update Users</a></li>
            <li><a href='/Listusers' className="nav-link">List Users</a></li>
            <li><a href='/Deleteusers' className="nav-link">Delete Users</a></li>
            <li><a href='#' className="nav-link">Form Progress</a></li>
          </ul>
        </nav>
      </section>
    </div>
  );
};

export default Nav;
