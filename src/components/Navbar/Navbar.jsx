import React from 'react'
import logo from '../../assets/images/cutprologo.png'
import { LuScissors } from "react-icons/lu";

const Navbar = () => {
  return (
    <>
      <nav className="bg-white">
        <div className="container">
          <div className="flex justify-between items-baseline">
            <div className="Logo">
              <a href="">
                <div className="p-4 bg-white">
                  <h2 className="font-poppins font-semibold text-black text-[42px] flex items-baseline gap-1">
                    CutPro <LuScissors className='text-[blue] ' />
                  </h2>
                </div>
              </a>
            </div>
            <div className="Menu">
              <ul className="flex gap-3">
                <li>
                  <a href="">Home</a>
                </li>
                <li>
                  <a href="">Home</a>
                </li>
                <li>
                  <a href="">Home</a>
                </li>
                <li>
                  <a href="">Home</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar