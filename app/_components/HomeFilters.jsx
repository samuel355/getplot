import React from "react";
import { BadgeCent, Briefcase, Building, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const HomeFilters = () => {
  return (
    <div className="px-8 lg:px-24 md:-mt-3r lg:mt-3 mt-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5 gap-2 bg-white p-4 shadow-xl border rounded-md items-center">
        <div className="w-full p-2 rounded-lg bg-slate-100 dark:bg-hover-color-dark card-bordered">
          <h1 className="font-bold">Location</h1>
          <div className=" flex items-center gap-x-2 mt-1">
            <MapPin className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              className="w-full bg-transparent border-0 outline-none"
              placeholder="Enter location of the property"
            />
          </div>
        </div>

        <div className="w-full p-2 rounded-lg bg-slate-100 dark:bg-hover-color-dark card-bordered">
          <h1 className="font-bold">Property Type</h1>
          <div className="flex items-center gap-x-2 mt-1">
            <Building className="w-5 h-5 text-gray-500" />
            <select
              name=""
              id=""
              className="w-full bg-transparent border-0 outline-none dark:bg-hover-color-dark opacity-70"
            >
              <option value="condors">Condors</option>
              <option value="offfice buildings">Offfice Buildings</option>
              <option value="apartments">Apartments</option>
              <option value="mansions">Mansions</option>
              <option value="real estate">Real Estate</option>
              <option value="penthouse">Penthouse</option>
              <option value="living room">Living Room</option>
            </select>
          </div>
        </div>

        <div className="w-full p-2 rounded-lg bg-slate-100 dark:bg-hover-color-dark card-bordered">
          <h1 className="font-bold">Price range</h1>
          <div className="flex items-center gap-x-2 mt-1">
            <BadgeCent className="w-5 h-5 text-gray-500" />
            <select
              name=""
              id=""
              className="w-full bg-transparent border-0 outline-none dark:bg-hover-color-dark opacity-70"
            >
              <option value="GHS. 40,000 - GHS. 80,000">GHS. 40,000 - GHS. 80,000</option>
              <option value="GHS. 80,000 - GHS. 120,000">GHS. 80,000 - GHS. 120,000</option>
              <option value="GHS. 120,000 - GHS. 200,000">GHS. 120,000 - GHS. 200,000</option>
              <option value="GHS. 200,000 - GHS. 300,000">GHS. 200,000 - GHS. 300,000</option>
              <option value="GHS. 300,000 - GHS. 500,000">GHS. 300,000 - GHS. 500,000</option>
              <option value="GHS. 500,000 - GHS. 1000,000">GHS. 500,000 - GHS. 1,000,000</option>
            </select>
          </div>
        </div>

        <div className=" w-full p-2 border rounded-lg bg-slate-100 dark:bg-hover-color-dark dark:border-dark-light">
          <h1 className="font-bold">For</h1>
          <div className="flex items-center gap-x-2 mt-1">
            <Briefcase className="w-5 h-5 text-gray-500" />
            <select
              name=""
              id=""
              className="w-full bg-transparent border-0 outline-none opacity-70 dark:bg-hover-color-dark"
            >
              <option value="sell">Sell</option>
              <option value="rent">Rent</option>
            </select>
          </div>
        </div>

        <Button className="btn btn-primary text-base py-2">Search</Button>
      </div>
    </div>
  );
};

export default HomeFilters;
