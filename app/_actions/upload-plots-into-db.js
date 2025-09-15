import { useRef, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";

export async function insertFeatures(data) {
  console.log("Data ->", data);
  try {
    const transformedFeatures = data.map((feature) => ({
      type: "Feature Collection",
      geometry: feature.geometry,
      properties: feature.properties,
      //status: 'Available',
      plotTotalAmount: 250000,
      //status: renderStatus(feature.properties.STATUS),
      //owner_info: renderOwner(feature.properties.Status)
    }));

    const { data: result, error } = await supabase
      .from("saadi")
      .insert(transformedFeatures)
      .select("*");

    console.log(result);
    if (error) {
      console.error("Error inserting features:", error);
    } else {
      console.log("Inserted features:", result);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

function renderOwner(status) {
  if (status === "AVAILABLE") {
    return "L.H.C";
  } else if (status === "SOLD") {
    return "L.H.C";
  } else if (status === "SOLD_CHIEF") {
    return "Chief";
  } else if (status === "CHIEF") {
    return "Chief";
  } else if (status === "RESERVED") {
    return "L.H.C";
  } else if (status === "AVAILABLE_CHIEF") {
    return "Chief";
  } else {
    return null;
  }
}

function renderStatus(status) {
  if (status === "AVAILABLE") {
    return "Available";
  } else if (status === "SOLD") {
    return "Sold";
  } else if (status === "SOLD_CHIEF") {
    return "Sold";
  } else if (status === "CHIEF") {
    return "Sold";
  } else if (status === "RESERVED") {
    return "Reserved";
  } else if (status === "AVAILABLE_CHIEF") {
    return "Available";
  } else {
    return null;
  }
}

// const insertCalled = useRef(false);

// useEffect(() => {
//   if (!insertCalled.current) {
//     insertFeatures(trabuomShapeFile);
//     insertCalled.current = true; // Prevent further inserts
//   }
// }, [trabuomShapeFile]);
