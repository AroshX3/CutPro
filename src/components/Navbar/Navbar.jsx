import React, { useState } from "react";
import { LuScissors } from "react-icons/lu";
import { HiOutlineMenuAlt3, HiX } from "react-icons/hi";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-[21px] px-4">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <div className="flex items-center gap-2">
            <h2 className="font-poppins font-semibold text-[42px] flex items-center gap-1">
              CutPro
              <LuScissors className="text-blue-600 text-2xl" />
            </h2>
          </div>

          {/* DESKTOP MENU */}
          <ul className="hidden md:flex gap-6 font-medium">
            <li>
              <a href="#" className="hover:text-blue-600">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                Calculator
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                Presets
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                About
              </a>
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
              <a href="#" className="block">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="block">
                Calculator
              </a>
            </li>
            <li>
              <a href="#" className="block">
                Presets
              </a>
            </li>
            <li>
              <a href="#" className="block">
                About
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
