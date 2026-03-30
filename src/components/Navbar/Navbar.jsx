import React, { useState } from "react";
import { LuScissors } from "react-icons/lu";
import { HiOutlineMenuAlt3, HiX } from "react-icons/hi";
import { Link } from "react-router";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-[21px] px-4">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <div className="flex items-center gap-2">
            <a href="/" className="font-poppins font-semibold text-[42px] flex items-center gap-1">
              CutPro
              <LuScissors className="text-[blue] text-[30px]" />
            </a>
          </div>

          <ul className="hidden md:flex gap-6 font-medium">
            <li>
              <Link to="/" className="hover:text-blue-600">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-blue-600">
                About
              </Link>
            </li>
            <li>
              <Link to="/cuttingCenter" className="hover:text-blue-600">
                Cutting Center
              </Link>
            </li>
          </ul>

          {/* MOBILE BUTTON */}
          <button className="md:hidden text-3xl" onClick={() => setOpen(!open)}>
            {open ? <HiX /> : <HiOutlineMenuAlt3 />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-white shadow-lg">
          <ul className="flex flex-col gap-4 px-6 py-4 font-medium">
            <li>
              <Link to="/" className="block">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="block">
                About
              </Link>
            </li>
            <li>
              <link to="/cuttingCenter" className="block">
                Cutting Center
              </link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
