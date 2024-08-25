import React from "react";
import Sidebar from "./dashboard/_components/Sidebar";
import MobileMenu from "./dashboard/_components/MobileMenu";

const layout = ({ children }) => {
  return (
    <div className="w-full bg-slate-50 h-screen max-h-screen">
      <div className="flex flex-row gap-4 items-center">
        <div className="fixed w-[25%] overflow-hidden max-w-[25%] box-border hidden md:flex lg:flex xl:flex">
          <Sidebar />
        </div>

        <div className="md:w-[75%] w-full h-screen bg-white rounded-md shadow-md md:ml-[25.1%]">
          <div>
            <MobileMenu />
            <div className="px-4 md:px-8 pt-2 md:pt-7 md:m-2 relative z-0">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default layout;
