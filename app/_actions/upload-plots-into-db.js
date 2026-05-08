import { useRef, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";

export async function insertFeatures(data) {
  console.log("Data ->", data);
  try {
    const transformedFeatures = data.map((feature) => ({
      type: "Feature Collection",
      geometry: feature.geometry,
      properties: {
        ...feature.properties,
      },
      //status: 'Available',
      plotTotalAmount: 40000,
      status: renderStatus(feature.properties.landUse),
      //owner_info: renderOwner(feature.properties.Status)
    }));

    const { data: result, error } = await supabase
      .from("new_trabuom")
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
  if (
    status === "Residential" ||
    status === "Agriculture" ||
    status === "Mixed Use" ||
    status === "School" ||
    status === "Commercial" ||
    status === "Church" ||
    status === "Education"
  ) {
    return "Available";
  } else if (
    status === "Nature Reserve" ||
    status === "Palace Ground" ||
    status === "Sanitation" ||
    status === "Public Utility" ||
    status === "Civic and Culture" ||
    status === "Police" || status === 'Open Space'
  ) {
    return "Reserved";
  } else {
    return 'Unspecified';
  }
}

