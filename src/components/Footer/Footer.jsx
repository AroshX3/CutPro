import React from "react";
import { LuScissors } from "react-icons/lu";
import { Link } from "react-router";

const Footer = () => {
  return (
    <>
      <footer className="bg-gray-900 text-white py-10 mt-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between gap-10">
            <div className="w-full sm:w-auto">
              <a href="#">
                <div className="flex items-center gap-2">
                  <h2 className="font-poppins font-semibold text-[32px] flex items-center gap-1">
                    CutPro <LuScissors className="text-blue-400 text-[28px]" />
                  </h2>
                </div>
              </a>
              <p className="text-gray-400 mt-2 text-sm">
                Precision cutting. Zero waste. Maximum efficiency.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link to="/" className="hover:text-blue-400 transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-blue-400 transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cuttingCenter"
                    className="hover:text-blue-400 transition"
                  >
                    Cutting Center
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Contact</h4>
              <ul className="text-gray-300 space-y-2">
                <li>Email: aroshapple@gmail.com</li>
                <li>Phone: +880 1712789908</li>
                <li>Dhaka, Bangladesh</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-10 pt-4 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} CutPro. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
