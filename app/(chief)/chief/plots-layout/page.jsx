"use client";
import React from "react";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import MapLayout from "../components/MapLayout";
const page = () => {
  const [plots, setPlots] = useState([]);
  const [center, setCenter] = useState({
    lng: -1.7135335931285836,
    lat: 6.640967246477618,
  });

  useEffect(() => {
    getPlots();
  }, []);

  //Fetch Plots from supabase
  const getPlots = async () => {
    const { data, error } = await supabase.from("saadi").select("*");

    if (data) {
      setPlots(data);

      if (plots.length > 0) {
        setCenter({
          lng: plots[0].geometry.coordinates[0][0][1],
          lat: plots[0].geometry.coordinates[0][0][0],
        });
      }
    }
    if (error) {
      console.log(error);
    }
  };
  return (
    <div className="flex flex-col md:flex-col items-start md:items-center justify-between mb-6">
      <h1 className="text-2xl font-bold tracking-tight mb-4 ">
        Plot Layout
      </h1>
      <MapLayout geoJsonData={plots} parcels={plots} center={center} />
    </div>
  );
};

export default page;
