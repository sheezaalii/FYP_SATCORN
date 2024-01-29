import React from "react";
import { Link } from "react-router-dom";
// import { createPopper } from "@popperjs/core";
import Register from "views/auth/Register.js"; // Import your Register component

const PagesDropdown = () => {
  return (
    <>
      <Link to="/register">
        <a className="lg:text-white lg:hover:text-blueGray-200 text-blueGray-700 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold border border-white rounded">
          GET STARTED
        </a>
      </Link>
    </>
  );
};

export default PagesDropdown;
