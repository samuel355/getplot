import React from "react";
import Sidebar from "./dashboard/_components/Sidebar";
import MobileMenu from "./dashboard/_components/MobileMenu";

const layout = ({ children }) => {
  return (
    <div className="w-full h-screen max-h-screen">
      <div className="flex flex-row gap-4 items-center">
        <div className="fixed sidebar top-0 w-[25%] overflow-hidden max-w-[25%] box-border hidden md:flex lg:flex xl:flex  z-20">
          <Sidebar />
        </div>

        <div className="md:w-[75%] md:mt-0 md:ml-[22%] md:mr-[1.5rem] md:mb-[1.5rem] main-content lg:w-full xl:w-full h-full bg-white  overflow-x-hidden">
          <div className="w-full">
            <MobileMenu />
            <div className="px-4 pt-2 md:pt-7 md:m-2 relative z-0">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default layout;
