"use client";
import Footer from "@/app/_components/Footer";
import Map from "@/app/_components/Map";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Header from "@/app/_components/Header";

const page = () => {
  const [plots, setPlots] = useState([]);
  const [center, setCenter] = useState({
    lng: -1.6633491209999534,
    lat: 6.6715352750000534,
  });

  useEffect(() => {
    getPlost();
  }, []);

  //Fetch Plots from supabase
  const getPlost = async () => {
    const { data, error } = await supabase.from("nthc").select("*");

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
    <>
    <Header />
      <div className="w-full mx-12 overflow-x-hidden mb-8 pt-[7.5rem]">
        <h1 className="font-bold text-lg my-4 text-center capitalize">
          NTHC SITE
        </h1>
        <div className="px-28 my-3 underline">
          <a target="_blank" href={'https://earth.google.com/web/@5.72013147,-0.07041293,25.77825883a,1000d,30y,0h,0t,0r/data=OgMKATA'}> View site in Google Earth</a>
        </div>
        <Map geoJsonData={plots} parcels={plots} center={center} />
      </div>
      <Footer />
    </>
  );
};

export default page;
