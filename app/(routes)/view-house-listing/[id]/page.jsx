"use client";

import { supabase } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Slider from "../_components/Slider";
import Details from "../_components/Details";
import GoogleMapSection from "@/app/_components/GoogleMapSection";
import AgentDetails from "../_components/AgentDetails";
import Footer from "@/app/_components/Footer";
import Image from "next/image";
import Header from "@/app/_components/Header";

const ViewListing = () => {
  const [listingDetails, setListingDetails] = useState();

  const { id } = useParams();

  useEffect(() => {
    getListingDetails();
  }, []);

  const getListingDetails = async () => {
    const { data, error } = await supabase
      .from("houselistings")
      .select("*, houseListingImages(url, listing_id, id)")
      .eq("id", id);
    //.eq("active", true)

    if (data) {
      setListingDetails(data[0]);
    }
    if (error) {
      toast("Sorry error occured");
      console.log(error);
    }
  };

  return (
    <>
      <Header />
      <div className="w-full pt-[7.5rem]">
        <div className="md:px-12 lg:px-12 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5 border-b pb-4">
            <Slider imageLists={listingDetails?.houseListingImages} />
            <Details listingDetails={listingDetails} />
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="font-bold text-2xl text-center mb-4 text-primary">
                Find on Map
              </h2>
              <Image
                width={100}
                height={100}
                className="w-10 h-10 object-contain -mt-6"
                alt="icon"
                src={"/location-house-pin.png"}
              />
            </div>
            <GoogleMapSection
              searchedCoordinates={listingDetails?.coordinates}
              listing={[listingDetails]}
              images={listingDetails?.houseListingImages}
            />
          </div>
          <div className="my-6">
            <h2 className="text-primary text-2xl font-bold mb-6">Agent Info</h2>
            <AgentDetails listingDetails={[listingDetails]} />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default ViewListing;
