import { useRef, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";

export async function insertFeatures(features) {
  try {
    const transformedFeatures = features.map((feature) => ({
      type: feature.geometry.type,
      geometry: feature.geometry,
      properties: feature.properties,
    }));

    const { data, error } = await supabase
      .from("trabuom_duplicate")
      .insert(transformedFeatures)
      .select("*");

    console.log(data);
    if (error) {
      console.error("Error inserting features:", error);
    } else {
      console.log("Inserted features:", data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}


// const insertCalled = useRef(false);

// useEffect(() => {
//   if (!insertCalled.current) {
//     insertFeatures(trabuomFeatures);
//     insertCalled.current = true; // Prevent further inserts
//   }
// }, [trabuomFeatures]);
