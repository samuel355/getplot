"use client";
import Footer from "@/app/_components/Footer";
import Map from "@/app/_components/Map";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useRef, useState } from "react";
import Header from "@/app/_components/Header";
import { insertFeatures } from "../../_actions/upload-plots-into-db";
import { trabuomNewFeatures } from "../trabuom/trabuom-new-features";

const page = () => {
  const [plots, setPlots] = useState([]);
  const [center, setCenter] = useState({
    lng: -1.7057369777796925,
    lat: 6.649850287766676,
  });

  useEffect(() => {
    getPlots();
  }, []);

  //Fetch Plots from supabase
  const getPlots = async () => {
    const { data, error } = await supabase.from("yabi").select("*");

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
          Yabi SITE
        </h1>
        {/* <div className="px-28 my-3 underline">
          <a target="_blank" href={'https://earth.google.com/web/@6.667374,-1.6625795,243.92036376a,1000d,30y,0h,0t,0r/data=CgRCAggBMigKJgokCiAxa05NMTVJN2JvUGVUUkNTSXNtTUNzb1ZsOERpMUg4dyACOgMKATA'}> View site in Google Earth</a>
        </div> */}
        <Map geoJsonData={plots} parcels={plots} center={center} />
      </div>
      <Footer />
    </>
  );
};

export default page;
