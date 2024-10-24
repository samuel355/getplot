"use client";
import { useEffect, useState, useRef } from "react";
import { GoogleMap, Polygon, useLoadScript } from "@react-google-maps/api";
import { supabase } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
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
import { ExpressInterestDialog } from "@/app/_components/express-interest-dialog";
import { insertFeatures } from "../../_actions/upload-plots-into-db";
import {trabuomFeatures} from './trabuomFeature'
const containerStyle = {
  height: "75vh",
  width: "85%",
};

const center = {
  lat: 6.5967673180000475,
  lng: -1.7712607859999707,
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
  const pathname = usePathname();

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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [interestPlotId, setInterestPlotId] = useState();

  let table;
  if (pathname.includes("trabuom")) {
    table = "trabuom";
  }
  if (pathname.includes("nthc")) {
    table = "nthc";
  }
  if (pathname.includes("legon-hills")) {
    table = "legon-hills";
  }
  if (pathname.includes("dar-es-salaam")) {
    table = "dar-es-salaam";
  }

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  });

  useEffect(() => {
    if (mapBounds) {
      fetchPolygons(mapBounds);
    }
  }, [mapBounds]);

  // Fetch all polygons and filter by map bounds
  const fetchPolygons = async (bounds) => {
    const cacheKey = "trabuom_polygons";
    const cacheExpiryKey = "trabuom_polygons_expiry";
    const cacheExpiryDuration = 0.25 * 60 * 60 * 1000; //15 mins
    
    const currentTime = Date.now();
    
    // Check if polygons exist in localStorage and are still valid
    const cachedPolygons = localStorage.getItem(cacheKey);
    const cachedExpiry = localStorage.getItem(cacheExpiryKey);
    
    if (cachedPolygons && cachedExpiry && currentTime < parseInt(cachedExpiry)) {
      // Use cached data
      const polygons = JSON.parse(cachedPolygons);
      
      const visiblePolygons = polygons.filter((polygon) => {
        const polygonBounds = calculateBoundingBox(polygon);
        return isPolygonInBounds(polygonBounds, bounds);
      });
      
      setPolygons(visiblePolygons);
      return;
    }
  
    let allRecords = [];
    setLoading(true);
  
    // Fetch from Supabase if no valid cache
    const fetchBatch = async (start, end) => {
      let { data, error } = await supabase.from("trabuom").select("*").range(start, end);
      if (error) {
        console.log(error);
        return [];
      }
      return data || [];
    };
  
    // Fetch all records in batches
    allRecords = [
      ...(await fetchBatch(0, 999)),
      ...(await fetchBatch(1000, 1999)),
      ...(await fetchBatch(2000, 2999)),
      ...(await fetchBatch(3000, 3050)),
    ];
  
    if (allRecords.length > 0) {
      // Save to localStorage
      localStorage.setItem(cacheKey, JSON.stringify(allRecords));
      localStorage.setItem(cacheExpiryKey, (currentTime + cacheExpiryDuration).toString());
  
      // Filter polygons based on bounds
      const visiblePolygons = allRecords.filter((polygon) => {
        const polygonBounds = calculateBoundingBox(polygon);
        return isPolygonInBounds(polygonBounds, bounds);
      });
  
      setPolygons(visiblePolygons);
    }
    
    setLoading(false);
  };
  


  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance); // map instance in state
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

             <p id="expressInterest" style="display: ${
               status === "Sold" || status === "Reserved" ? "none" : "block"
             }" data-id=${id} class="border px-4 py-1 rounded-md text-sm font-normal mt-1 cursor-pointer">
            Express Interest
          </p>
  
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

    google.maps.event.addListener(infoWindow, "domready", () => {
      const Btn = document.getElementById("expressInterest");
      Btn.addEventListener("click", () => {
        const id = Btn.getAttribute("data-id");
        setIsDialogOpen(true);
        setInterestPlotId(id);

        if (openInfoWindow) {
          openInfoWindow.close();
        }
      });
    });

    openInfoWindow = infoWindow;
  };

  function getColorBasedOnStatus(status) {
    if (status === "Available" || status === null) {
      return "green";
    } else if (status === "Reserved") {
      return "black";
    } else if (status === "Sold") {
      return "red";
    } else if (status === undefined) {
      return "blue";
    } else {
      return "orange"; // Optional: handle unexpected status values
    }
  }

  const handleInput = (event) => {
    const charCode = event.which ? event.which : event.keyCode;
    // Prevent input if the key is not a number (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  };

  const hanldeSaveNewPrice = async () => {
    setLoading(true);
    let newPrice = document.getElementById("newPrice").value;
    let newAmount;
    if (newPrice === undefined || newPrice === "" || newPrice === null) {
      toast.error("Check the new Price");
      setNewPriceEr(true);
      setLoading(false);
      return;
    } else {
      newAmount = parseFloat(newPrice);

      if (isNaN(newAmount) || newAmount <= 0) {
        toast.error("Check the new Price");
        setNewPriceEr(true);
        setLoading(false);
        return;
      } else {
        setNewPriceEr(false);
        setLoading(false);
      }
    }
    let database;

    if (path === "/nthc") {
      database = "nthc";
    }
    if (path === "/dar-es-salaam") {
      database = "dar_es_salaam";
    }
    if (path === "/legon-hills") {
      database = "legon_hills";
    }

    let plotTotalAmount;
    let paidAmount;
    let remainingAmount;
    try {
      // Await the response from Supabase
      const response = await supabase
        .from(database)
        .select("plotTotalAmount, paidAmount, remainingAmount, id")
        .eq("id", plotID);

      // Destructure the response to get data and error
      const { data, error } = response;

      // Check if there's an error
      if (error) {
        setLoading(false);
        setModalOpen(false);
        console.error("Error fetching data:", error);
        toast.error("Sorry Error occured updating the plot price");
        return; // Exit the function if there's an error
      }

      // Ensure data exists and is in the expected format
      if (data && data.length > 0) {
        plotTotalAmount = data[0].plotTotalAmount;
        paidAmount = data[0].paidAmount;
        remainingAmount = data[0].remainingAmount;

        if (plotTotalAmount === null || plotTotalAmount === undefined) {
          plotTotalAmount = 0;
        }
        if (paidAmount === null || paidAmount === undefined) {
          paidAmount = 0;
        }
        if (remainingAmount === null || remainingAmount === undefined) {
          remainingAmount = 0;
        }

        remainingAmount = newAmount - paidAmount;
      } else {
        setLoading(false);
        setModalOpen(false);
        console.log("No data found for the given plot ID.");
      }
    } catch (error) {
      setLoading(false);
      setModalOpen(false);
      console.error("Unexpected error:", err);
    }

    saveInfo(remainingAmount, newAmount, paidAmount, database);
  };

  const saveInfo = async (remainingAmount, newAmount, paidAmount, database) => {
    const { data, error } = await supabase
      .from(database)
      .update({
        plotTotalAmount: newAmount,
        remainingAmount: remainingAmount,
        paidAmount: paidAmount,
      })
      .eq("id", plotID)
      .select();

    if (data) {
      console.log(data);
      tToast("Plot Price updated successfully");
      setLoading(false);
      setModalOpen(false);
      window.location.reload();
    }
    if (error) {
      setLoading(false);
      console.log(error);
    }
  };

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
          <form>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild></DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Change Plot Price</DialogTitle>
                  <DialogDescription className="flex items-center gap-4 text-gray-800 text-sm">
                    <span className="font-semibold text-sm">
                      Plot Details:{" "}
                    </span>
                    <p className=" text-sm" id="description"></p>
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-4 font-medium">
                    <Label htmlFor="name" className="text-right">
                      Old Price:
                    </Label>
                    <p id="old-price" className="text-base text-gray-800"></p>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newprice" className="text-right">
                      New Price (GHS.)
                    </Label>
                    <Input
                      className="col-span-3"
                      type="number"
                      id="newPrice"
                      style={{ border: newPriceEr && "1px solid red" }}
                      onKeyPress={handleInput}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={hanldeSaveNewPrice} type="button">
                    {loading ? (
                      <Loader className="animate-spin" />
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </form>
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
                    fillColor: getColorBasedOnStatus(polygon.status),
                    fillOpacity: 0.9,
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
      {isDialogOpen && (
        <ExpressInterestDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          plotId={interestPlotId}
          setIsDialogOpen={setIsDialogOpen}
          table={table}
        />
      )}
    </>
  );
};

export default Map;
