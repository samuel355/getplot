"use client";
import { property } from "@/data/dummyData";
import SingleProductCard from "./SingleProductCard";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const Featured = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchFeature();
  }, []);

  const fetchFeature = async () => {
    const { data, error } = await supabase
      .from("houselistings")
      .select("*, houseListingImages(id, url, listing_id)")
      //.eq("active", true)
      .order("created_at", { ascending: false });

    if (data) {
      setProperties(data);
    }
    if (error) {
      console.log(error);
    }
  };

  return (
    <>
      {properties && (
        <div className="py-24 px-12">
          <div className="text-center">
            <h1 className="mx-auto p-2 text-primary/80 text-sm bg-cyan-100 rounded-full w-32 capitalize text-center">
              featured
            </h1>
            <h1 className="font-bold text-xl capitaliz pt-6 capitalize">
              explore featured latest properties
            </h1>
          </div>
          <div className="flex flex-wrap gap-6 mt-4 lg:px-8">
            {properties.slice(0, 3).map((featured) => (
              <SingleProductCard key={featured.id} property={featured} />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Featured;
