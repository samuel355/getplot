"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { GoogleMap, Polygon, useLoadScript } from "@react-google-maps/api";
import { supabase } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";

import { toast } from "react-toastify";
import { toast as tToast } from "sonner";
import { useUser } from "@clerk/nextjs";
import Header from "@/app/_components/Header";
import { ExpressInterestDialog } from "@/app/_components/express-interest-dialog";
import { useCart } from "@/store/useStore";

import GoogleMapsProvider from "@/providers/google-map-provider";
import TrabuomMap from "./_components/TrabuomMap";
import ChangePriceDialog from "./_components/ChangePriceDialog";
import ChangeStatusDialog from "./_components/ChangeStatusDialog";
import StatusBar from "./_components/StatusBar";
import MobileNavBar from "./_components/MobileNavBar";
import { calculateBoundingBox, isPolygonInBounds } from "./actions/mapUtils";
import { fetchPolygons } from "./actions/fetchPolygons";

// Updated map container style to work with the new padding
const containerStyle = {
  height: "80vh",
  width: "100%", // This will be constrained by the parent container width
};

const center = {
  lat: 6.5967673180000475,
  lng: -1.7712607859999707,
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
  const openInfoWindowRef = useRef(null);

  // New state variables for enhanced functionality
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [interestPlotId, setInterestPlotId] = useState();
  const [mapType, setMapType] = useState("hybrid");
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
      fetchPolygons(
        mapBounds,
        setPolygons,
        setLoading,
        calculateBoundingBox,
        isPolygonInBounds
      );
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
    if (openInfoWindowRef) {
      openInfoWindowRef.close();
    }
  };

  //Add info Window

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
        }" href="tel:0548554216" id="call-for-info" class="border px-4 py-1 rounded-md text-sm font-normal">
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
          user?.primaryEmailAddress?.emailAddress !=
            "samueloseiboatenglistowell57@gmail.com" &&
          user?.primaryEmailAddress?.emailAddress !=
            "profpakoto@gmail.com" && "none"
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

    // if (openInfoWindow) {
    //   openInfoWindow.close();
    // }

    // Create a new info window
    const infoWindow = new google.maps.InfoWindow({
      position: centroid,
    });

    if (openInfoWindowRef.current) {
      openInfoWindowRef.current.close();
    }
    openInfoWindowRef.current = infoWindow;

    infoWindow.setContent(contentString);
    infoWindow.open(map);


    google.maps.event.addListener(infoWindow, "domready", () => {
      const callInfo = document.getElementById("call-for-info");
      callInfo.addEventListener("click", () => {
        alert("Call For Info \n 0322008282 or +233 54 855 4216");
      });

      //Change Price
      const Btn = document.getElementById("changePlotID");
      Btn.addEventListener("click", () => {
        setLoading(false)
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
              setLoading(false)
          }

          setPlotID(id);
        }, 1000);

        if (openInfoWindowRef.current) {
          openInfoWindowRef.current.close();
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

    // Change Status
    google.maps.event.addListener(infoWindow, "domready", () => {
      const Btn = document.getElementById("changeStatus");
      if (Btn) {
        Btn.addEventListener("click", () => {
          const id = Btn.getAttribute("data-id");
          setStatusPlotId(id);
          setIsStatusModalOpen(true);
          if (openInfoWindowRef.current) {
            openInfoWindowRef.current.close();
          }
        });
      }
    });

    //openInfoWindowRef = infoWindow;
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
      setLoading(true)
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
      // setTimeout(() => {
      //   window.location.reload();
      // }, 1000);
      setNewStatus("")
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
          <ChangePriceDialog
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            onClose={onClose}
            hanldeSaveNewPrice={hanldeSaveNewPrice}
            loading={loading}
            newPriceEr={newPriceEr}
            handleInput={handleInput}
          />

          {/* Dialog for changing status */}
          <ChangeStatusDialog
            isStatusModalOpen={isStatusModalOpen}
            setIsStatusModalOpen={setIsStatusModalOpen}
            newStatus={newStatus}
            setNewStatus={setNewStatus}
            handleSaveNewStatus={handleSaveNewStatus}
            statusLoading={statusLoading}
          />

          {/* Map container with additional class for fullscreen */}
          <TrabuomMap
            map={map}
            setMap={setMap}
            mapType={mapType}
            polygons={polygons}
            handleMapLoad={handleMapLoad}
            handleBoundsChanged={handleBoundsChanged}
            getColorBasedOnStatus={getColorBasedOnStatus}
            handleInfo={handleInfo}
            isMapTypeMenuOpen={isMapTypeMenuOpen}
            setIsMapTypeMenuOpen={setIsMapTypeMenuOpen}
            changeMapType={changeMapType}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            fitBoundsToAllParcels={fitBoundsToAllParcels}
            tToast={tToast}
          />

          {/* Mobile-friendly bottom navigation bar */}
          <MobileNavBar
            map={map}
            setIsMapTypeMenuOpen={setIsMapTypeMenuOpen}
            isMapTypeMenuOpen={isMapTypeMenuOpen}
            fitBoundsToAllParcels={fitBoundsToAllParcels}
          />
          {/* Status bar with properties count */}
          <StatusBar
            polygons={polygons}
            fitBoundsToAllParcels={fitBoundsToAllParcels}
          />
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
