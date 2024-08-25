import { Bath, BedDouble, CarFront, MapPin, Ruler, Search } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import GoogleAddressSearch from "./GoogleAddressSearch";
import { Button } from "@/components/ui/button";
import FilterSesction from "./FilterSesction";
import Link from "next/link";
import LandFilterSection from "./LandFilterSection";
import { useRouter } from "next/navigation";

const LandListing = ({
  listing,
  handleSearchClick,
  searchedAddress,
  searchedCoordinates,
  getSearchedResult,

  showSA,
  setShowSA,
}) => {
  const [address, setAddress] = useState();
  const router = useRouter();

  return (
    <div>
      <div className="">
        <div className="p-1 flex items-center gap-2 justify-between">
          <GoogleAddressSearch
            selectedAddress={(value) => {
              setShowSA(false);
              searchedAddress(value);
              setAddress(value);
            }}
            setCoordinates={(value) => searchedCoordinates(value)}
          />
          <Button onClick={handleSearchClick} className="flex gap-2">
            {" "}
            <Search className="h-4 w-4" />{" "}
            <span className="hidden lg:block md:block xl:block">Search</span>
          </Button>
        </div>

        <div>
          <LandFilterSection
          // setHomeType={setHomeType}
          />
        </div>
      </div>

      <div className="">
        <div className="text-center text-gray-500 my-3">
          {showSA && address && (
            <div>
              <h2 className="text-lg">
                Found{" "}
                <span className="text-primary font-bold">
                  {listing?.length}
                </span>{" "}
                Results in{" "}
                <span className="font-bold text-primary">{address.label}</span>
              </h2>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-10">
          {listing?.length > 0
            ? listing.map((item, index) => (
                <div
                  key={index}
                  className="shadow-sm rounded p-2 hover:border hover:border-primary"
                >
                  <Link href={"/view-land-listing/" + item.id}>
                    <Image
                      className="object-cover h-[150px] rounded cursor-pointer"
                      src={item.landListingImages[0]?.url}
                      width={800}
                      height={150}
                      alt="land listing image"
                    />
                  </Link>
                  <div className="flex flex-col gap-2 mt-3">
                    <h2 className="font-bold text-xl text-primary">
                      GHS {item.price.toLocaleString()}
                    </h2>
                    <h2 className="flex gap-2 items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4" /> {item.address}
                    </h2>
                  </div>
                  <div className="bg-slate-100 rounded-md p-2 text-gray-400 mt-3">
                    <div className="flex items-center justify-between text-sm py-2 border-b">
                      <p className="flex items-center gap-1">
                        <Ruler className="h-4 w-4" /> <span>Area Size</span>
                      </p>
                      <p className="">
                        <span>{item?.areaSize} sqft.</span>
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full my-2 text-base cursor-pointer"
                    onClick={() => router.push("/view-land-listing/" + item.id)}
                  >
                    View Details
                  </Button>
                </div>
              ))
            : [1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
                <div
                  key={index}
                  className="h-[230px] w-full bg-slate-200 animate-pulse rounded-lg"
                ></div>
              ))}

          {getSearchedResult && <p>No Results found</p>}

          {listing.length <= 0 && <p>No Listing found</p>}
        </div>
      </div>
    </div>
  );
};

export default LandListing;
