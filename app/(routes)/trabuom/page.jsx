"use client";
import { useEffect, useState } from "react";
import { GoogleMap, Polygon, useLoadScript } from "@react-google-maps/api";
import { supabase } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import {trabuomFeatures} from './trabuomData'
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { toast as tToast } from "sonner";
import { Loader } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Header from "@/app/_components/Header";

const containerStyle = {
  height: "75vh",
  width: "85%",
};

const center = {
  lat: 6.5901048210000681,
  lng: -1.7678195729999402,
};

// Function to calculate the bounding box for a polygon
const calculateBoundingBox = (polygon) => {
  let minLat = Infinity,
    maxLat = -Infinity,
    minLng = Infinity,
    maxLng = -Infinity;

  polygon.geometry.coordinates[0].forEach(([lng, lat]) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });

  return { minLat, maxLat, minLng, maxLng };
};

// Check if a polygon's bounding box intersects with the map bounds
const isPolygonInBounds = (polygonBounds, mapBounds) => {
  return !(
    polygonBounds.maxLat < mapBounds.south ||
    polygonBounds.minLat > mapBounds.north ||
    polygonBounds.maxLng < mapBounds.west ||
    polygonBounds.minLng > mapBounds.east
  );
};

const Map = () => {
  const [polygons, setPolygons] = useState([]);
  const [map, setMap] = useState(null); // Store the map object here
  const [mapBounds, setMapBounds] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [plotID, setPlotID] = useState();
  const path = usePathname();
  const [newPrice, setNewPrice] = useState("");
  const { user, isSignedIn } = useUser();
  const [newPriceEr, setNewPriceEr] = useState(false);
  const [loading, setLoading] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  });

  useEffect(() => {
    if (mapBounds) {
      fetchPolygons(mapBounds);
    }
    //updatePrice();
  }, [mapBounds]);

  // Fetch all polygons and filter by map bounds
  const fetchPolygons = async (bounds) => {
    let allRecords;
    setLoading(true);
    // First batch (records 0 to 999)
    let { data: records1, error1 } = await supabase
      .from("trabuom")
      .select("*")
      .range(0, 999);

    if (error1) {
      console.log(error1);
      return;
    }

    if (records1 || records1 !== null) {
      allRecords = records1;
      // Second batch (records 1000 to 1999)
      let { data: records2, error2 } = await supabase
        .from("trabuom")
        .select("*")
        .range(1000, 1999);

      if (error2) {
        console.log(error2);
        return;
      }
      if (records2 || records2 !== null) {
        allRecords = [...allRecords, ...records2];
        // Third batch (records 2000 to 2999)
        let { data: records3, error3 } = await supabase
          .from("trabuom")
          .select("*")
          .range(2000, 2999);

        if (error3) {
          console.log(error3);
          return;
        }
        if (records3 || records3 !== null) {
          allRecords = [...allRecords, ...records3];

          // Fourth batch (records 3000 to 3279)
          let { data: records4, error4 } = await supabase
            .from("trabuom")
            .select("*")
            .range(3000, 3279);

          if (error4) {
            console.log(error4);
            return;
          }
          if (records4 || records4 !== null) {
            allRecords = [...allRecords, ...records4];
            setLoading(false);
            // Filter polygons by checking their bounding box against the map bounds
            const visiblePolygons = allRecords.filter((polygon) => {
              const polygonBounds = calculateBoundingBox(polygon);
              return isPolygonInBounds(polygonBounds, bounds);
            });

            setPolygons(visiblePolygons);
          }
        }
      }
    }
  };

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance); // Set the map instance in state
    const bounds = mapInstance.getBounds();
    if (bounds) {
      setMapBounds({
        south: bounds.getSouthWest().lat(),
        west: bounds.getSouthWest().lng(),
        north: bounds.getNorthEast().lat(),
        east: bounds.getNorthEast().lng(),
      });
    }
  };

  const handleBoundsChanged = () => {
    if (map) {
      const bounds = map.getBounds();
      if (bounds) {
        setMapBounds({
          south: bounds.getSouthWest().lat(),
          west: bounds.getSouthWest().lng(),
          north: bounds.getNorthEast().lat(),
          east: bounds.getNorthEast().lng(),
        });
      }
    }
  };

  const onClose = () => {
    setModalOpen(true);
    if (openInfoWindow) {
      openInfoWindow.close();
    }
  };

  //Add info Window
  var openInfoWindow = null;
  const handleInfo = (coordinates, text1, text2, id, amount, status) => {
    console.log(id);
    const contentString = `
        <div class="max-w-sm rounded overflow-hidden shadow-lg">
          <div class="px-6 py-4 flex flex-col">
            <div class="font-bold md:text-lg lg:text-lg text-sm mb-2">Plot Number ${text1}, ${text2}</div>
            <hr />
            <a style="display: ${
              status === "Sold" || status === "Reserved" ? "none" : "block"
            }"  href="${path}/buy-plot/${id}" class="border px-4 py-1 mt-3 mb-1 rounded-md text-sm font-normal">
              Buy Plot
            </a>
  
            <a style="display: ${
              status === "Reserved" || status === "Sold" ? "none" : "block"
            }" href="${path}/reserve-plot/${id}" id="reserve_plot_button" class="border mb-1 px-4 py-1 my-2 rounded-md text-sm font-normal">
              Reserve Plot
            </a>
  
            <a style= "display: ${
              user?.publicMetadata?.role != "sysadmin" && "none"
            }" href="${path}/edit-plot/${id}" id="edit_plot_button" class="border px-4 py-1 mb-2 rounded-md text-sm font-normal">
              Edit Plot
            </a>
  
            <a href="tel:0322008282" class="border px-4 py-1 rounded-md text-sm font-normal">
              Call For Info
            </a>
  
            <button style= "display: ${
              user?.publicMetadata?.role != "sysadmin" && "none"
            }" id="changePlotID" data-id=${id}  data-text="${text1}, ${text2}" amount="${amount}" class="bg-primary w-full py-2 mt-3 text-white" id="changePlotID">Change Plot Price</button>
          </div>
        </div>
      `;

    const polygonCoords = coordinates.map((coord) => ({
      lng: coord[0],
      lat: coord[1],
    }));

    // Calculate the centroid of the polygon
    const bounds = new google.maps.LatLngBounds();
    polygonCoords.forEach((coord) => bounds.extend(coord));
    const centroid = bounds.getCenter();

    if (openInfoWindow) {
      openInfoWindow.close();
    }

    // Create a new info window
    const infoWindow = new google.maps.InfoWindow({
      position: centroid,
    });

    infoWindow.setContent(contentString);
    infoWindow.open(map);

    google.maps.event.addListener(infoWindow, "domready", () => {
      const Btn = document.getElementById("changePlotID");
      Btn.addEventListener("click", () => {
        const content = Btn.getAttribute("data-text");
        const id = Btn.getAttribute("data-id");
        const amountStr = Btn.getAttribute("amount");

        setModalOpen(true);

        setTimeout(function () {
          document.getElementById(
            "description"
          ).innerHTML = `Plot number ${content}`;

          let amount;
          if (amountStr === null || amountStr === "") {
            amount = null;
          } else {
            amount = parseFloat(amountStr);
          }

          if (amount === null || isNaN(amount)) {
            document.getElementById("old-price").innerHTML = "GHS. 0.00";
          } else {
            document.getElementById("old-price").innerHTML =
              "GHS. " + amount.toLocaleString();
          }

          setPlotID(id);
        }, 1000);

        if (openInfoWindow) {
          openInfoWindow.close();
        }
      });
    });

    openInfoWindow = infoWindow;
  };

  const handleInput = (event) => {
    const charCode = event.which ? event.which : event.keyCode;
    // Prevent input if the key is not a number (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  };

  // async function insertFeatures(features) {
  //   try {
  //     const transformedFeatures = features.map((feature) => ({
  //       type: feature.type,
  //       geometry: feature.geometry,
  //       properties: feature.properties,
  //     }));

  //     const { data: checkDatabase, error: checkError } = await supabase
  //       .from("trabuom_duplicate")
  //       .select("*");

  //     if (checkError) {
  //       console.log(checkError);
  //       return;
  //     }
  //     if (checkDatabase.length === 0) {
  //       // Insert the transformed features into the 'trabuom' table
  //       const { data, error } = await supabase
  //         .from("trabuom_duplicate")
  //         .insert(transformedFeatures)
  //         .select("*");

  //       console.log(data);
  //       if (error) {
  //         console.error("Error inserting features:", error);
  //       } else {
  //         console.log("Inserted features:", data);
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Error:", err);
  //   }
  // }

  // useEffect(() => {
  //   //insertFeatures(trabuomFeatures);
  // }, [])

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      <Header />
      <div className="w-full mx-12 overflow-x-hidden mb-8 pt-[7.5rem]">
        <h1 className="font-bold text-lg my-4 text-center capitalize">
          TRABOUM SITE
        </h1>
        <div className="w-full flex flex-col items-center justify-center relative">
          {modalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded shadow-lg">
                <button
                  className="absolute top-2 right-2 text-gray-700"
                  onClick={onClose}
                >
                  &times;
                </button>
                <p>Here we go</p>
              </div>
            </div>
          )}
          <GoogleMap
            className="relative"
            key={"google-map-1"}
            mapContainerStyle={containerStyle}
            center={center}
            zoom={15}
            onLoad={handleMapLoad} // Correctly handle onLoad
            onBoundsChanged={handleBoundsChanged} // Update bounds when the map bounds change
          >
            <div className="absolute w-40 top-20 left-0 bg-white/90 shadow-md">
              <div className="flex gap-3 max-w-36 items-center pl-2 pt-3">
                <div className="w-4 h-4 bg-green-800"></div>
                <span>Available</span>
              </div>
              <div className="flex gap-3 max-w-36 items-center pl-2 mt-2">
                <div className="w-4 h-4 bg-black"></div>
                <span>Reserved</span>
              </div>
              <div className="flex gap-3 max-w-36 items-center pl-2 mt-2 pb-3">
                <div className="w-4 h-4 bg-red-600"></div>
                <span>Sold</span>
              </div>
            </div>

            {/* {loading && (
              <div className="flex flex-col justify-center items-center">
                <Loader className="animate-spin" />
              </div>
            )} */}

            {polygons.map((polygon, index) => (
              <>
                <Polygon
                  key={index}
                  paths={polygon.geometry.coordinates[0].map(([lng, lat]) => ({
                    lat,
                    lng,
                  }))}
                  options={{
                    fillColor: "#00FF00",
                    fillOpacity: 0.4,
                    strokeColor: "black",
                    strokeOpacity: 0.8,
                    strokeWeight: 1,
                  }}
                  onClick={() =>
                    handleInfo(
                      polygon.geometry?.coordinates[0],
                      polygon.properties?.Plot_No,
                      polygon.properties?.Street_Nam,
                      polygon.id,
                      polygon.plotTotalAmount,
                      polygon.status
                    )
                  }
                />
              </>
            ))}
          </GoogleMap>
        </div>
      </div>
    </>
  );
};

export default Map;
