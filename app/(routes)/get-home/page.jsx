import Footer from "@/app/_components/Footer";
import ListingMapView from "@/app/_components/ListingMapView";
import React from "react";
import Header from "@/app/_components/Header";

const Listings = () => {
  return (
    <>
      <Header />
      <div className="w-full pb-14 bg-white pt-[7.5rem]">
        <div className="px-10">
          <ListingMapView type="For Sell" />
        </div>
      </div>
    </>
  );
};

export default Listings;
