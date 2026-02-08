import React from "react";
import logo from "../assets/images/logo.png";
import { Link } from "react-router-dom";

const HomeNav = () => {
  return (
    <nav className="w-full box-border px-6 py-4 flex items-center justify-between border-b border-[#03EF62]">
      <img src={logo} alt="Logo" className="h-10 w-auto" />
      <div className="flex gap-6">
        <Link to="/" className="hover:text-blue-600 p-2">Feature</Link>
        <Link to="/about" className="hover:text-blue-600 p-2">About Us</Link>
        <Link to="/signup" className="hover:text-blue-600 font-semibold bg-[#03EF62] p-2 rounded-[25px]">
          Get Started
        </Link>
      </div>
    </nav>
  );
};

export default HomeNav;
