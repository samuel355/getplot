"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "sonner";
import GoogleMapSection from "./GoogleMapSection";
import LandListing from "./LandListing";


const LandListingMapView = () => {
  const [listing, setListing] = useState([]);
  const [searchedAddress, setSearchedAddress] = useState();
  const [searchedCoordinates, setSearchedCoordinates] = useState();
  const [getSearchedResult, setGetSearchResult] = useState(false);

  //Filters
  const [showSA, setShowSA] = useState(false);
  const [landType, setLandType] = useState();

  useEffect(() => {
    getLatestListing();
  }, []);

  const getLatestListing = async () => {
    const { data, error } = await supabase
      .from("landlistings")
      .select("*, landListingImages(url, listing_id, id)")
      //.eq("active", true)
      .order("created_at", { ascending: false });

    if (data) {
      setListing(data);
    }
    if (error) {
      console.log(error);
    }
  };


  const handleSearchClick = async () => {
    setShowSA(false);
    // const searchTerm = searchedAddress?.value?.structured_formatting?.main_text;

    // if (searchTerm != "") {
    //   let query = supabase
    //     .from("landlistings")
    //     .select("*, landListingImages(url, listing_id, id)")
    //     //.eq("active", true)
    //     .eq("type", type)
    //     .like("address", "%" + searchTerm + "%")
    //     .order("created_at", { ascending: false });

    //   if (landType) {
    //     query = query.eq("propertyType", landType);
    //   }
    //   const { data, error } = await query;

    //   if (data) {
    //     setShowSA(true);
    //     setGetSearchResult(false);
    //     setListing(data);
    //   } else {
    //     setShowSA(true);
    //     console.log("nothing");
    //     setGetSearchResult(true);
    //   }
    //   if (error) {
    //     setShowSA(false);
    //     toast("Sorry something went wrong with the search");
    //     console.log(error);
    //   }
    // } else {
    //   setShowSA(false);
    //   toast("Sorry something went wrong with the search");
    // }
  };

  return (
    <>
      <div className="flex gap-6 w-full flex-wrap md:flex-nowrap">
        <div className="w-full md:w-1/2 lg:w-1/2 overflow-y-scroll h-screen no-scrollbar pr-3">
          {listing.length > 0 && (
            <LandListing
              listing={listing}
              handleSearchClick={handleSearchClick}
              searchedAddress={(value) => setSearchedAddress(value)}
              searchedCoordinates={(value) => setSearchedCoordinates(value)}
              getSearchedResult={getSearchedResult}
              setLandType={setLandType}
              showSA={showSA}
              setShowSA={setShowSA}
            />
          )}
        </div>

        <div className="w-full md:w-1/2 lg:w-1/2 fixed-column no-scrollbar ml-8 hidden md:block lg:block xl:block pb-24">
          <GoogleMapSection
            listing={listing}
            searchedCoordinates={searchedCoordinates}
            images={listing[0]?.landListingImages}
          />
        </div>
      </div>
    </>
  );
};

export default LandListingMapView;
