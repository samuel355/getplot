import LandListingMapView from "@/app/_components/LandListingMapView";
import React from "react";
import Header from "@/app/_components/Header";

const GetPlot = () => {
  return (
    <div>
      <Header />
      <div className="w-full bg-white pb-14 pt-[7.5rem]">
        <div className="px-10">
          <LandListingMapView />
        </div>
      </div>
    </div>
  );
};

export default GetPlot;
