"use client";
import { useEffect, useState, useRef, useCallback } from "react";
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
import { useCart } from "@/store/useStore";

// Additional imports for enhanced controls
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize,
  MapPin,
  Layers,
  RefreshCw,
  Navigation,
  Info,
} from "lucide-react";
import GoogleMapsProvider from "@/providers/google-map-provider";

// Updated map container style to work with the new padding
const containerStyle = {
  height: "80vh",
  width: "100%", // This will be constrained by the parent container width
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
  const mapRef = useRef(null);

  // New state variables for enhanced functionality
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [interestPlotId, setInterestPlotId] = useState();
  const [mapType, setMapType] = useState("roadmap");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMapTypeMenuOpen, setIsMapTypeMenuOpen] = useState(false);

  const { addPlot, isInCart } = useCart();

  // New state for Change Status modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusPlotId, setStatusPlotId] = useState();
  const [newStatus, setNewStatus] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

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

  useEffect(() => {
    if (mapBounds) {
      fetchPolygons(mapBounds);
    }
  }, [mapBounds]);

  // Function to handle fullscreen toggle
  const toggleFullscreen = () => {
    const mapContainer = document.querySelector(".map-container");
    if (!isFullscreen) {
      if (mapContainer.requestFullscreen) {
        mapContainer.requestFullscreen();
      } else if (mapContainer.mozRequestFullScreen) {
        mapContainer.mozRequestFullScreen();
      } else if (mapContainer.webkitRequestFullscreen) {
        mapContainer.webkitRequestFullscreen();
      } else if (mapContainer.msRequestFullscreen) {
        mapContainer.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Function to handle map type change
  const changeMapType = (type) => {
    setMapType(type);
    if (map) {
      map.setMapTypeId(type);
    }
    setIsMapTypeMenuOpen(false);
  };

  // Function to fit bounds to all parcels
  const fitBoundsToAllParcels = () => {
    if (map && polygons && polygons.length > 0) {
      const bounds = new google.maps.LatLngBounds();

      polygons.forEach((feature) => {
        if (
          feature.geometry &&
          feature.geometry.coordinates &&
          feature.geometry.coordinates[0]
        ) {
          feature.geometry.coordinates[0].forEach((coord) => {
            bounds.extend({ lat: coord[1], lng: coord[0] });
          });
        }
      });

      map.fitBounds(bounds, 50); // 50px padding

      // Prevent zooming too far
      google.maps.event.addListenerOnce(map, "idle", () => {
        if (map.getZoom() > 19) map.setZoom(19);
        if (map.getZoom() < 16) map.setZoom(16);
      });
    }
  };

  // Fetch all polygons and filter by map bounds
  const fetchPolygons = async (bounds) => {
    const cacheKey = "trabuom_polygons";
    const cacheExpiryKey = "trabuom_polygons_expiry";
    const cacheExpiryDuration = 0.15 * 60 * 60 * 1000; //15 mins

    const currentTime = Date.now();

    // Check if polygons exist in localStorage and are still valid
    const cachedPolygons = localStorage.getItem(cacheKey);
    const cachedExpiry = localStorage.getItem(cacheExpiryKey);

    if (
      cachedPolygons &&
      cachedExpiry &&
      currentTime < parseInt(cachedExpiry)
    ) {
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
      let { data, error } = await supabase
        .from("trabuom")
        .select("*")
        .range(start, end);
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
      //localStorage.setItem(cacheKey, JSON.stringify(allRecords));
      //localStorage.setItem(cacheExpiryKey, (currentTime + cacheExpiryDuration).toString());

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
    mapRef.current = mapInstance;

    // Add custom controls to the map
    mapInstance.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
      document.getElementById("map-controls")
    );

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
  const handleInfo = (
    coordinates,
    text1,
    text2,
    id,
    amount,
    status,
    polygon
  ) => {
    let plot_size = polygon?.properties?.Area.toFixed(2);
    const contentString = `
    <div class="max-w-sm rounded overflow-hidden shadow-lg">
      <div class="px-2 py-3 flex flex-col">
        <div className="font-bold md:text-lg lg:text-lg text-sm mb-2" style="margin-bottom: 5px; font-weight: bold">Plot Number ${text1}, ${text2}</div>
        <div className="font-bold md:text-lg lg:text-lg text-sm mb-2" style="margin-toop: 2px; font-weight: bold">Size:  ${plot_size} Acres / ${(
      43560 * plot_size
    ).toLocaleString()} Square ft</div>
        <div className="font-bold md:text-lg lg:text-lg text-sm mb-2" style="margin-top: 8px; font-weight: bold">GHS. ${polygon.plotTotalAmount.toLocaleString()} </div>
        <p style="display: ${
          status === "On Hold" ? "block" : "none"
        }; margin-top: 5px; margin-bottom: 5px"> This plot is on hold for a client for 48 hours 
          <span style= "display: ${
            user?.publicMetadata?.role != "sysadmin" && "none"
          }"> 
            You can edit this plot and change the status  
          </span> 
        </p>
        <hr style="margin-bottom: 5px; margin-top: 5px" />

          <button style="display: ${
            status === "Sold" || status === "Reserved" || status === "On Hold"
              ? "none"
              : "block"
          }" class="border px-4 py-1 mt-3 mb-1 rounded-md text-sm font-normal bg-black text-white" id="add-to-cart" 
        data-cart='${encodeURIComponent(JSON.stringify(polygon))}'
        >Add to Cart</button>
        
        <a style="display: ${
          status === "Sold" || status === "Reserved" || status === "On Hold"
            ? "none"
            : "block"
        }"  href="${path}/buy-plot/${id}" class="border px-4 py-1 mt-3 mb-1 rounded-md text-sm font-normal">
          Buy Plot
        </a>

        <a style="display: ${
          status === "Reserved" || status === "Sold" || status === "On Hold"
            ? "none"
            : "block"
        }" href="${path}/reserve-plot/${id}" id="reserve_plot_button" class="border mb-1 px-4 py-1 my-2 rounded-md text-sm font-normal">
          Reserve Plot
        </a>

        <a style= "display: ${
          user?.publicMetadata?.role != "sysadmin" && "none"
        }" href="${path}/edit-plot/${id}" id="edit_plot_button" class="border px-4 py-1 mb-2 rounded-md text-sm font-normal">
          Edit Plot
        </a>

        <a style="margin-top: ${
          status === "Reserved" || status === "Sold" ? "7px" : "0"
        }" href="tel:0248838005" id="call-for-info" class="border px-4 py-1 rounded-md text-sm font-normal">
          Call For Info
        </a>

        <p id="expressInterest" style="display: ${
          status === "Sold" || status === "Reserved" || status === "On Hold"
            ? "none"
            : "block"
        }" data-id=${id} class="border px-4 cursor-pointer py-1 rounded-md text-sm font-normal mt-1">
          Express Interest
        </p>

        <button style= "display: ${
          user?.publicMetadata?.role != "sysadmin" && "none"
        }" data-id=${id}  data-text="${text1}, ${text2}" amount="${amount}" class="bg-primary w-full py-2 mt-3 text-white" id="changePlotID">Change Plot Price</button>

        <button style= "display: ${
          user?.primaryEmailAddress?.emailAddress != "samueloseiboatenglistowell57@gmail.com" && "none"
        }" data-id=${id}  data-text="${text1}, ${text2}" amount="${amount}" class="bg-primary w-full py-2 mt-3 text-white" id="changeStatus">Change Status</button>

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
      const callInfo = document.getElementById("call-for-info");
      callInfo.addEventListener("click", () => {
        alert("Call For Info \n 0322008282 or +233 54 855 4216");
      });

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

    // Add to cart
    google.maps.event.addListener(infoWindow, "domready", () => {
      const Btn = document.getElementById("add-to-cart");
      if (Btn) {
        const cartData = decodeURIComponent(Btn.getAttribute("data-cart"));
        Btn.addEventListener("click", () => {
          try {
            let parsedData = JSON.parse(cartData);
            parsedData = {
              ...parsedData,
              location: "Trabuom-Kumasi",
              table_name: "trabuom",
            };
            if (isInCart(parsedData.id)) {
              toast.error("Plot already in cart");
              if (openInfoWindow) {
                openInfoWindow.close();
              }
            } else {
              addPlot(parsedData);
              tToast.success("Plot added to cart");
              if (openInfoWindow) {
                openInfoWindow.close();
              }
            }
          } catch (error) {
            console.error("Error parsing JSON:", error);
            toast.error("Sorry Error occured adding to cart");
            if (openInfoWindow) {
              openInfoWindow.close();
            }
          }
        });
      }
    });

    google.maps.event.addListener(infoWindow, "domready", () => {
      const Btn = document.getElementById("changeStatus");
      if (Btn) {
        Btn.addEventListener("click", () => {
          const id = Btn.getAttribute("data-id");
          setStatusPlotId(id);
          setIsStatusModalOpen(true);
          if (openInfoWindow) {
            openInfoWindow.close();
          }
        });
      }
    });

    openInfoWindow = infoWindow;
  };

  function getColorBasedOnStatus(status) {
    if (status === null || status === "Available" || status === undefined) {
      return "green";
    } else if (status === "Reserved") {
      return "black";
    } else if (status === "Sold") {
      return "red";
    } else if (status === "On Hold") {
      return "grey"; // Optional: handle unexpected status values
    } else {
      return "orange";
    }
  }

  function renderMarkerColor(status) {
    if (status === null || status === "Available" || status === undefined) {
      return "black";
    } else if (status === "Reserved") {
      return "white";
    } else if (status === "Sold") {
      return "black";
    } else if (status === "On Hold") {
      return "grey"; // Optional: handle unexpected status values
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
    if (path === "/yabi") {
      database = "yabi";
    }
    if (path === "/trabuom") {
      database = "trabuom";
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
      console.error("Unexpected error:", error);
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
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    if (error) {
      setLoading(false);
      console.log(error);
    }
  };

  // Handler to save new status to Supabase
  const handleSaveNewStatus = async () => {
    setStatusLoading(true);
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
    if (path === "/yabi") {
      database = "yabi";
    }
    if (path === "/trabuom") {
      database = "trabuom";
    }
    try {
      const { data, error } = await supabase
        .from(database)
        .update({ status: newStatus })
        .eq("id", statusPlotId)
        .select();
      if (error) {
        tToast.error("Error updating status");
        setStatusLoading(false);
        return;
      }
      tToast.success("Plot status updated successfully");
      setStatusLoading(false);
      setIsStatusModalOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setStatusLoading(false);
      tToast.error("Unexpected error");
    }
  };

  return (
    <GoogleMapsProvider>
      <Header />
      {/* Updated container with px-10 and md:px-14 padding */}
      <div className="w-full px-10 md:px-14 overflow-x-hidden mb-8 pt-[7.5rem]">
        <h1 className="font-bold text-lg my-4 text-center capitalize">
          TRABOUM SITE
        </h1>
        <div className="w-full z-10 flex md:hidden flex-row items-center mb-4">
          <div className="flex w-full items-center space-x-3">
            <div className="w-4 h-4 bg-green-800 rounded-sm"></div>
            <span>Available</span>
          </div>
          <div className="flex w-full items-center space-x-3">
            <div className="w-4 h-4 bg-black rounded-sm"></div>
            <span>Reserved</span>
          </div>
          <div className="flex w-full items-center space-x-3">
            <div className="w-4 h-4 bg-red-600 rounded-sm"></div>
            <span>Sold</span>
          </div>
        </div>

        {/* Map container */}
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

          {/* Dialog form for changing price */}
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

          {/* Dialog for changing status */}
          <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
            <DialogTrigger asChild></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Change Plot Status</DialogTitle>
                <DialogDescription className="flex items-center gap-4 text-gray-800 text-sm">
                  <span className="font-semibold text-sm">Select new status for this plot.</span>
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newStatus" className="text-right">
                    Status
                  </Label>
                  <select
                    id="newStatus"
                    className="col-span-3 border rounded px-2 py-1"
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                  >
                    <option value="">Select status</option>
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveNewStatus} type="button" disabled={!newStatus || statusLoading}>
                  {statusLoading ? <Loader className="animate-spin" /> : "Save Status"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Map container with additional class for fullscreen */}
          <div className="map-container relative w-full">
            <GoogleMap
              className="relative"
              key={"google-map-1"}
              mapContainerStyle={containerStyle}
              center={center}
              zoom={15}
              onLoad={handleMapLoad}
              onBoundsChanged={handleBoundsChanged}
              options={{
                fullscreenControl: false,
                streetViewControl: true,
                mapTypeControl: false,
                zoomControl: false,
                scrollwheel: true,
                gestureHandling: "greedy",
                mapTypeId: mapType,
              }}
            >
              {/* Legend for plot status */}
              <div className="absolute w-40 top-20 left-0 bg-white/90 shadow-md rounded-md z-10 hidden md:flex md:flex-col justify-center items-center">
                <div className="p-2 bg-gray-100 font-medium rounded-t-md w-full">
                  Land Status
                </div>
                <div className="flex gap-3 w-full items-center pl-2 pt-3">
                  <div className="w-4 h-4 bg-green-800 rounded-sm"></div>
                  <span>Available</span>
                </div>
                <div className="flex gap-3 w-full items-center pl-2 mt-2">
                  <div className="w-4 h-4 bg-black rounded-sm"></div>
                  <span>Reserved</span>
                </div>
                <div className="flex gap-3 w-full items-center pl-2 mt-2 pb-3">
                  <div className="w-4 h-4 bg-red-600 rounded-sm"></div>
                  <span>Sold</span>
                </div>
              </div>

              {/* Custom map controls */}
              <div
                id="map-controls"
                className="absolute top-4 right-4 bg-white shadow-lg rounded-lg p-2 flex flex-col gap-2 z-10"
              >
                {/* Zoom controls */}
                <button
                  onClick={() => map && map.setZoom(map.getZoom() + 1)}
                  className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn size={20} />
                </button>
                <button
                  onClick={() => map && map.setZoom(map.getZoom() - 1)}
                  className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut size={20} />
                </button>

                {/* Separator */}
                <div className="border-t border-gray-200 my-1"></div>

                {/* Map type control */}
                <div className="relative">
                  <button
                    onClick={() => setIsMapTypeMenuOpen(!isMapTypeMenuOpen)}
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                    title="Change map type"
                  >
                    <Layers size={20} />
                  </button>

                  {isMapTypeMenuOpen && (
                    <div className="absolute right-full mr-2 top-0 bg-white shadow-lg rounded-lg overflow-hidden">
                      <button
                        onClick={() => changeMapType("roadmap")}
                        className={`px-3 py-2 w-full text-left hover:bg-gray-100 ${
                          mapType === "roadmap"
                            ? "bg-blue-50 text-blue-600"
                            : ""
                        }`}
                      >
                        Road Map
                      </button>
                      <button
                        onClick={() => changeMapType("satellite")}
                        className={`px-3 py-2 w-full text-left hover:bg-gray-100 ${
                          mapType === "satellite"
                            ? "bg-blue-50 text-blue-600"
                            : ""
                        }`}
                      >
                        Satellite
                      </button>
                      <button
                        onClick={() => changeMapType("hybrid")}
                        className={`px-3 py-2 w-full text-left hover:bg-gray-100 ${
                          mapType === "hybrid" ? "bg-blue-50 text-blue-600" : ""
                        }`}
                      >
                        Hybrid
                      </button>
                      <button
                        onClick={() => changeMapType("terrain")}
                        className={`px-3 py-2 w-full text-left hover:bg-gray-100 ${
                          mapType === "terrain"
                            ? "bg-blue-50 text-blue-600"
                            : ""
                        }`}
                      >
                        Terrain
                      </button>
                    </div>
                  )}
                </div>

                {/* Fullscreen toggle */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  <Maximize size={20} />
                </button>

                {/* Fit all parcels */}
                <button
                  onClick={fitBoundsToAllParcels}
                  className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                  title="Show all plots"
                >
                  <MapPin size={20} />
                </button>

                {/* Refresh map */}
                <button
                  onClick={() => window.location.reload()}
                  className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                  title="Refresh map"
                >
                  <RefreshCw size={20} />
                </button>

                {/* Help/Info Button */}
                <button
                  onClick={() =>
                    tToast.info(
                      "Click on any plot to see details and take actions",
                      { duration: 5000 }
                    )
                  }
                  className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                  title="Help"
                >
                  <Info size={20} />
                </button>
              </div>

              {/* Map polygons */}
              {polygons.map((polygon, index) => (
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
                    strokeColor: "#000000",
                  }}
                  onClick={() =>
                    handleInfo(
                      polygon.geometry?.coordinates[0],
                      polygon.properties?.Plot_No,
                      polygon.properties?.Street_Nam,
                      polygon.id,
                      polygon.plotTotalAmount,
                      polygon.status,
                      polygon
                    )
                  }
                />
              ))}
            </GoogleMap>

            {/* Mobile-friendly bottom navigation bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-20 flex justify-around items-center py-2 border-t">
              <button
                onClick={() => map && map.setZoom(map.getZoom() + 1)}
                className="p-2 rounded-full flex flex-col items-center text-xs text-gray-700"
              >
                <ZoomIn size={18} />
                <span>Zoom In</span>
              </button>
              <button
                onClick={() => map && map.setZoom(map.getZoom() - 1)}
                className="p-2 rounded-full flex flex-col items-center text-xs text-gray-700"
              >
                <ZoomOut size={18} />
                <span>Zoom Out</span>
              </button>
              <button
                onClick={() => setIsMapTypeMenuOpen(!isMapTypeMenuOpen)}
                className="p-2 rounded-full flex flex-col items-center text-xs text-gray-700"
              >
                <Layers size={18} />
                <span>Map Type</span>
              </button>
              <button
                onClick={fitBoundsToAllParcels}
                className="p-2 rounded-full flex flex-col items-center text-xs text-gray-700"
              >
                <MapPin size={18} />
                <span>All Plots</span>
              </button>
            </div>
          </div>

          {/* Status bar with properties count */}
          <div className="w-full bg-white shadow-md rounded-md mt-2 p-2 text-sm flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-gray-500" />
              <span>Trabuom-Kumasi • {polygons.length || 0} plots shown</span>
            </div>
            <div>
              <button
                onClick={fitBoundsToAllParcels}
                className="text-primary hover:underline flex items-center gap-1"
              >
                <MapPin size={14} />
                <span>View All Plots</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Express Interest Dialog */}
      {isDialogOpen && (
        <ExpressInterestDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          plotId={interestPlotId}
          setIsDialogOpen={setIsDialogOpen}
          table={table}
        />
      )}
    </GoogleMapsProvider>
  );
};

export default Map;
