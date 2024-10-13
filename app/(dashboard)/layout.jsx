import React from "react";
import Sidebar from "./dashboard/_components/Sidebar";
import MobileMenu from "./dashboard/_components/MobileMenu";

const layout = ({ children }) => {
  return (
    <div className="w-full h-screen max-h-screen">
      <div className="flex flex-row gap-4 items-center">
        <div className="fixed top-0 w-[25%] overflow-hidden max-w-[25%] box-border hidden md:flex lg:flex xl:flex">
          <Sidebar />
        </div>

        <div className="md:w-[75%] lg:w-ful xl:w-full h-full bg-white rounded-md shadow-md md:ml-[20%] overflow-x-hidden">
          <div className="w-full">
            <MobileMenu />
            <div className="px-4 md:px-8 pt-2 md:pt-7 md:m-2 relative z-0">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default layout;
