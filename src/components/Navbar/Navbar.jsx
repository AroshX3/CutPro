import React, { useState } from "react";
import { LuScissors } from "react-icons/lu";
import { HiOutlineMenuAlt3, HiX } from "react-icons/hi";
import { Link } from "react-router";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-[21px] px-4">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="font-poppins font-semibold text-[32px] sm:text-[38px] flex items-center gap-1"
              onClick={handleClose}
            >
              CutPro
              <LuScissors className="text-blue-600 text-[26px]" />
            </Link>
          </div>

          {/* DESKTOP MENU */}
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
        <div className="md:hidden bg-white shadow-lg border-t">
          <ul className="flex flex-col gap-4 px-6 py-4 font-medium">
            <li>
              <Link to="/" onClick={handleClose} className="block">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={handleClose} className="block">
                About
              </Link>
            </li>
            <li>
              <Link to="/cuttingCenter" onClick={handleClose} className="block">
                Cutting Center
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
