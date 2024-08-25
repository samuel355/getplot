"use client";
import React, { useEffect, useState } from "react";
import Listing from "./Listing";
import { supabase } from "@/utils/supabase/client";
import { toast } from "sonner";
import GoogleMapSection from "./GoogleMapSection";

const ListingMapView = ({ type }) => {
  const [listing, setListing] = useState([]);
  const [searchedAddress, setSearchedAddress] = useState();
  const [searchedCoordinates, setSearchedCoordinates] = useState();
  const [getSearchedResult, setGetSearchResult] = useState(false)

  //Filters
  const [showSA, setShowSA] = useState(false)
  const [bedCount, setBedCount] = useState(0)
  const [bathCount, setBathCount] = useState(0)
  const [parkingCount, setParkingCount] = useState(0)
  const [homeType, setHomeType] = useState()


  useEffect(() => {
    getLatestListing();
  }, []);

  const getLatestListing = async () => {
    const { data, error } = await supabase
      .from("houselistings")
      .select("*, houseListingImages(url, listing_id, id)")
      //.eq("active", true)
      //.eq("type", type)
      .order("created_at", { ascending: false });

    if (data) {
      setListing(data);
    }
    if (error) {
      console.log(error);
    }
  };

  const handleSearchClick = async () => {
    setShowSA(false)
    // const searchTerm = searchedAddress?.value?.structured_formatting?.main_text;
    
    // if (searchTerm != "") {
    //   let query = supabase
    //     .from("houselistings")
    //     .select("*, houseListingImages(url, listing_id, id)")
    //     //.eq("active", true)
    //     .eq("type", type)
    //     .gte("bedroom", bedCount)
    //     .gte("bathroom", bathCount)
    //     .gte("parking", parkingCount)
    //     .like('address','%'+searchTerm+'%')
    //     .order("created_at", { ascending: false });

    //   if(homeType){
    //     query = query.eq('propertyType', homeType)
    //   }
    //   const {data, error} = await query  

    //   if (data) {
    //     setShowSA(true)
    //     setGetSearchResult(false)
    //     setListing(data);
    //   }else{
    //     setShowSA(true)
    //     console.log('nothing')
    //     setGetSearchResult(true)
    //   }
    //   if (error) {
    //     setShowSA(false)
    //     toast('Sorry something went wrong with the search')
    //     console.log(error);
    //   }
    // }else{
    //   setShowSA(false)
    //   toast('Sorry something went wrong with the search')
    // }
  };

  return (
    <div className="flex gap-6 w-full flex-wrap md:flex-nowrap">
      <div className="w-full md:w-1/2 lg:w-1/2 overflow-y-scroll h-screen no-scrollbar pr-3">
        <Listing
          listing={listing}
          handleSearchClick={handleSearchClick}
          searchedAddress={(value) => setSearchedAddress(value)}
          searchedCoordinates={(value) => setSearchedCoordinates(value)}
          getSearchedResult={getSearchedResult}

          setBathCount={setBathCount}
          setBedCount ={setBedCount}
          setParkingCount={setParkingCount}
          setHomeType={setHomeType}

          showSA={showSA}
          setShowSA={setShowSA}
        />
      </div>

      <div className="w-full md:w-1/2 lg:w-1/2 fixed-column ml-8 hidden md:block lg:block xl:block  pb-24">
        <GoogleMapSection listing={listing} searchedCoordinates={searchedCoordinates} images={listing[0]?.houseListingImages} />
      </div>
    </div>
  );
};

export default ListingMapView;
