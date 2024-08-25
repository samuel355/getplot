
import GoogleMapSection from "@/app/_components/GoogleMapSection";
import { Button } from "@/components/ui/button";
import { Bath, BedDouble, CarFront, Drill, Home, MapPin, Upload } from "lucide-react";
import React from "react";
import AgentDetails from "./AgentDetails";

const Details = ({ listingDetails }) => {
  return (
    <div className="md:ml-6 lg:ml-6">
      <div className="flex items-center justify-between border-b pb-2 my-4 p-2">
        <div>
          <h2 className="text-primary font-bold text-2xl">GHS {listingDetails?.price.toLocaleString()}</h2>
          <p className="flex items-center text-gray-400 mt-3">
            <MapPin className="h-6 w-6 text-gray-400" />
            <span className="text-base ml-2">{listingDetails?.address}</span>
          </p>
        </div>
        <Button className="hidden lg:flex xl:flex items-center bg-primary text-white">
          {" "}
          <span className="text-lg ml-2"> Checkout </span>
        </Button>
      </div>

      <div className="p-2">
        <h2 className="text-primary text-xl font-bold">Key Features</h2>
        <div className="grid xs:grid-cols-1 grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 my-4 gap-3">
          <div className="flex items-center justify-center py-1 bg-cyan-100 rounded-sm shadow-sm text-primary p-2 gap-2">
            <Home className="w-5 h-5" />
            <p className="text-base">{listingDetails?.propertyType}</p>
          </div>

          <div className="flex items-center justify-center py-1 bg-cyan-100 rounded-sm shadow-sm text-primary p-2 gap-2">
            <Drill className="w-5 h-5" />
            <h2 className=" ">Built in</h2>
            <p className="text-base font-medium">{2019}</p>
          </div>

          <div className="flex items-center justify-center py-1 bg-cyan-100 rounded-sm shadow-sm text-primary p-2 gap-2">
            <Drill className="w-5 h-5" />
            <h2 className=" ">Size</h2>
            <p className="text-base font-medium">{listingDetails?.areaSize} sqft</p>
          </div>

          <div className="flex items-center justify-center py-1 bg-cyan-100 rounded-sm shadow-sm text-primary p-2 gap-2">
            <BedDouble className="w-5 h-5" />
            <p className="text-base font-medium">{listingDetails?.bedroom}</p>
            <h2 className=" ">Bedrooms</h2>
          </div>

          <div className="flex items-center justify-center py-1 bg-cyan-100 rounded-sm shadow-sm text-primary p-2 gap-2">
            <Bath className="w-5 h-5" />
            <p className="text-base font-medium">{listingDetails?.bathroom}</p>
            <h2 className=" ">Bathrooms</h2>
          </div>

          <div className="flex items-center justify-center py-1 bg-cyan-100 rounded-sm shadow-sm text-primary p-2 gap-2">
            <CarFront className="w-5 h-5" />
            <p className="text-base font-medium">{listingDetails?.parking}</p>
            <h2 className=" ">Bathrooms</h2>
          </div>
        </div>
      </div>

      <div className="p-2 mb-4">
        <h2 className="text-primary text-xl font-bold">Property Description</h2>
        <p>{listingDetails?.description}</p>
        
      </div>

      <div className="p-2">
       
      </div>

    </div>
  );
};

export default Details;
