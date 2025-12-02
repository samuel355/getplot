"use client";
import React from "react";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import MapLayout from "../components/MapLayout";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import AuthCheckChief from "../components/AuthCheckChief";

const Page = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState({
    lng: -1.7135335931285836,
    lat: 6.640967246477618,
  });

  const isChief = user?.publicMetadata?.role === "chief";
  const isChiefAsst = user?.publicMetadata?.role === "chief_asst";
  const chief_area = user?.publicMetadata?.area;

  // Determine database name
  let database_name;
  if (chief_area === "asokore_mampong") {
    database_name = "asokore_mampong";
  } else if (chief_area === "legon_hills") {
    database_name = "legon_hills";
  } else if (chief_area === "royal_court_estate") {
    database_name = "saadi";
  } else {
    toast.error("Unknown area specified");
    return;
  }

  useEffect(() => {
    if (!isSignedIn || !isLoaded) return;

    const fetchPlots = async () => {
      setLoading(true);
      try {
        if (!chief_area) {
          toast.error("Failed to fetch properties - area not specified");
          return;
        }

        const { data, error } = await supabase.from(database_name).select("*");

        if (error) {
          console.error("Database error:", error);
          toast.error("Error fetching properties from database");
          return;
        }

        if (data && data.length > 0) {
          setPlots(data);

          // Calculate center based on the first plot's coordinates
          const firstPlot = data[0];
          if (firstPlot?.geometry?.coordinates?.[0]?.[0]) {
            const [lng, lat] = firstPlot.geometry.coordinates[0][0];
            setCenter({ lng, lat });
          }
        } else {
          setPlots([]);
          toast.info("No properties found for this area");
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast.error("Error fetching properties");
      } finally {
        setLoading(false);
      }
    };

    fetchPlots();
  }, [isSignedIn, isLoaded, user]);

  // Update center when plots change
  useEffect(() => {
    if (plots.length > 0) {
      const firstPlot = plots[0];
      if (firstPlot?.geometry?.coordinates?.[0]?.[0]) {
        const [lng, lat] = firstPlot.geometry.coordinates[0][0];
        setCenter({ lng, lat });
      }
    }
  }, [plots]); // This effect runs whenever plots changes

  return (
    <AuthCheckChief>
      <div className="flex flex-col md:flex-col items-start md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Plot Layout</h1>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <MapLayout
            geoJsonData={plots}
            parcels={plots}
            center={center}
            database={database_name}
          />
        )}
      </div>
    </AuthCheckChief>
  );
};

export default Page;
