"use client";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { GoogleMap, Polygon, Polyline, MarkerF } from "@react-google-maps/api";
import mapboxgl from "mapbox-gl";
import { usePathname } from "next/navigation";

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
import { supabase } from "@/utils/supabase/client";
import { toast } from "react-toastify";
import { toast as tToast } from "sonner";
import { Loader } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { ExpressInterestDialog } from "./express-interest-dialog";
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
import { saadiRoad } from "@/saadi-layout/road";
import StreetLine from "./RoadsMap";
import BuyPlotDialog from "./buy-plot-dialog";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const Map = ({ parcels, center, setCartOpen }) => {
  const pathname = usePathname();
  const [map, setMap] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [plotID, setPlotID] = useState();
  const path = usePathname();
  const { user } = useUser();
  const [newPriceEr, setNewPriceEr] = useState(false);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  // New state variables for enhanced functionality
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [interestPlotId, setInterestPlotId] = useState();
  const [mapType, setMapType] = useState("hybrid");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMapTypeMenuOpen, setIsMapTypeMenuOpen] = useState(false);
  const { addPlot, isInCart } = useCart();

  // New state variables for status functionality
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusPlotId, setStatusPlotId] = useState();
  const [newStatus, setNewStatus] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  //Buy Plot Dialog State
  const [buyPlotDialog, setBuyPlotDialog] = useState(false);
  const [buyPlotId, setBuyPlotId] = useState();

  // Location determination logic
  let table;
  let location;
  let table_name;
  if (pathname.includes("trabuom")) {
    table = "trabuom";
    table_name = "trabuom";
    location = "Kumasi Trabuom";
  }
  if (pathname.includes("nthc")) {
    table = "nthc";
    table_name = "nthc";
    location = "Kwadaso NTHC - Kumasi";
  }
  if (pathname.includes("legon-hills")) {
    table = "legon-hills";
    location = "Santuo Accra";
    table_name = "legon_hills";
  }
  if (pathname.includes("dar-es-salaam")) {
    table = "dar-es-salaam";
    location = "Ejisu - Dar Es Salaam";
    table_name = "dar_es_salaam";
  }
  if (pathname.includes("yabi")) {
    table = "yabi";
    location = "Yabi Kumasi";
    table_name = "yabi";
  }
  if (pathname.includes("royal-court-estate")) {
    table = "saadi";
    location = "Yabi Kumasi";
    table_name = "saadi";
  }
  if (pathname.includes("berekuso")) {
    table = "berekuso";
    location = "Berekuso Eastern Region";
    table_name = "berekuso";
  }
  if (pathname.includes("asokore-mampong")) {
    table = "asokore-mampong";
    location = "Asokore Mampong Kumasi";
    table_name = "asokore_mampong";
  }

  const mapContainerStyle = {
    height: "94vh",
    width: "100%",
  };

  let zoom = 17.5;
  if (path === "/trabuom") {
    zoom = 17.4;
  }
  if (path === "/yabi") {
    zoom = 17.6;
  }
  if (path === "/asokore-mampong") {
    zoom = 17.8;
  }

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
    if (map && parcels && parcels.length > 0) {
      const bounds = new google.maps.LatLngBounds();

      parcels.forEach((feature) => {
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

  // Enhanced map load function
  const onLoad = useCallback(
    function callback(map) {
      mapRef.current = map;
      const bounds = new window.google.maps.LatLngBounds(center);
      map.fitBounds(bounds);

      // Add custom controls to the map
      map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
        document.getElementById("map-controls")
      );

      setTimeout(() => {
        map.setZoom(zoom);
        setMap(map);
      }, 1000);

      // Listen for fullscreen change events
      document.addEventListener("fullscreenchange", () => {
        setIsFullscreen(!!document.fullscreenElement);
      });
      document.addEventListener("webkitfullscreenchange", () => {
        setIsFullscreen(!!document.webkitFullscreenElement);
      });
      document.addEventListener("mozfullscreenchange", () => {
        setIsFullscreen(!!document.mozFullscreenElement);
      });
      document.addEventListener("MSFullscreenChange", () => {
        setIsFullscreen(!!document.msFullscreenElement);
      });
    },
    [center, zoom]
  );

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  //convert coordinates to lat and lng
  const asCoordinates = (coordinates) => {
    const result = [];
    for (const coord of coordinates) {
      const [lng, lat] = coord;
      result.push({ lng, lat });
    }
    return result;
  };

  //Add Marker inside Polygon
  const markerInfo = (coordinates, text, status) => {
    if (!map) return;

    const polygonCoords = [];
    for (const coord of coordinates) {
      const [lng, lat] = coord;
      polygonCoords.push({ lng, lat });
    }

    // Calculate the centroid of the polygon
    var bounds = new google.maps.LatLngBounds();
    polygonCoords.forEach(function (coord) {
      bounds.extend(coord);
    });
    var centroid = bounds.getCenter();

    // Add a label at the center
    var label = new google.maps.Marker({
      position: centroid,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 0, // Set scale to 0 to hide the marker
      },
      label: {
        text: text?.toString(),
        // color: renderMarkerColor(status),
        color: "white",
        fontSize: "11px",
        //fontWeight: "bold",
        scale: 0,
      },
      map: map,
    });
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
    feature
  ) => {
    let plot_size,
      legon_hills_price = 0;

    if (pathname === "/trabuom") {
      plot_size = feature?.properties?.Area.toFixed(2);
    } else if (pathname === "/nthc") {
      let plot_area = feature?.properties?.SHAPE_Area;
      plot_size = (plot_area * 3109111.525693).toFixed(2);
    } else if (pathname === "/legon-hills") {
      plot_size = feature?.properties?.Area.toFixed(2);
    } else if (pathname === "/dar-es-salaam") {
      plot_size = feature?.properties?.Area.toFixed(2);
    } else if (pathname === "/yabi") {
      plot_size = feature?.properties?.Area.toFixed(2);
    } else if (pathname === "/berekuso") {
      plot_size = feature?.properties?.Area.toFixed(2);
    } else if (pathname === "/royal-court-estate") {
      plot_size = feature?.properties?.Area.toFixed(2);
    } else if (pathname === "/asokore-mampong") {
      plot_size = feature?.properties?.Area.toFixed(2);
    }

    const contentString = `
    <div class="max-w-sm rounded overflow-hidden shadow-lg">
      <div class="px-2 py-3 flex flex-col">
        <div className="font-bold md:text-lg lg:text-lg text-sm mb-2" style="margin-bottom: 5px; font-weight: bold">Plot Number ${text1}, ${
      text2 ?? ""
    }</div>
        <div className="font-bold md:text-lg lg:text-lg text-sm mb-2" style="margin-top: 2px; font-weight: bold">Size:  ${plot_size} Acres / ${(
      43560 * plot_size
    ).toLocaleString()} Square ft </div>
        <div className="font-bold md:text-lg lg:text-lg text-sm mb-2" style="margin-top: 8px; font-weight: bold; display: ${
          ((status === "Sold" || status === "Reserved") &&
            user?.publicMetadata?.role != "sysadmin") ||
          !(Number(feature.plotTotalAmount) > 0)
            ? "none"
            : "block"
        }">
           
          ${
            pathname === "/legon-hills" && feature.plotTotalAmount > 0
              ? "$" + (43560 * plot_size * 8.5).toLocaleString()
              : Number(feature.plotTotalAmount) > 0
              ? "GHS. " + Number(feature.plotTotalAmount).toLocaleString()
              : ""
          }
        </div>

        <p style="margin-top: 12px; margin-bottom:12px; font-weight: bold; color: red; display: ${
          Number(feature.plotTotalAmount) === 0 &&
          (status === null || status === "Available" || status === undefined)
            ? "block"
            : "none"
        }">NOT READY FOR SALE YET</p>
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
          status === "Sold" ||
          status === "Reserved" ||
          status === "On Hold" ||
          Number(feature.plotTotalAmount) === 0
            ? "none"
            : "block"
        }" class="border px-4 py-1 mt-3 mb-1 rounded-md text-sm font-normal bg-black text-white" id="add-to-cart" 
        data-cart='${encodeURIComponent(JSON.stringify(feature))}'
        >Add to Cart</button>

        
        <p id="buyPlot" data-id=${id} style="display: ${
          status === "Sold" ||
          status === "Reserved" ||
          status === "On Hold" ||
          Number(feature.plotTotalAmount) === 0
            ? "none"
            : "block"
        }" class="border px-4 py-1 mt-3 mb-1 rounded-md text-sm font-normal cursor-pointer">
          Buy Plot
        </p>


        <a style="display: ${
          status === "Reserved" ||
          status === "Sold" ||
          status === "On Hold" ||
          Number(feature.plotTotalAmount) === 0
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

        <p id="expressInterest" style="opacity: ${
          Number(feature.plotTotalAmount) === 0 &&
          (status === null || status === "Available" || status === undefined)
            ? "0"
            : "1"
        }; display: ${
        status === "Sold" || status === "Reserved" || status === "On Hold"
        ? "none"
        : "block"
          }" data-id=${id} class="border px-4 cursor-pointer py-1 rounded-md text-sm font-normal mt-1">
          Express Interest
        </p>

        <button style= "display: ${
          user?.publicMetadata?.role != "sysadmin" && "none"
        }" id="changePlotID" data-id=${id}  data-text="${text1}, ${text2}" amount="${amount}" class="bg-primary w-full py-2 mt-3 text-white" id="changePlotID">Change Plot Price</button>

        <button style= "display: ${
          user?.primaryEmailAddress?.emailAddress !=
            "samueloseiboatenglistowell57@gmail.com" &&
          user?.primaryEmailAddress?.emailAddress != "profpakoto@gmail.com" &&
          "none"
        }" data-id=${id} class="bg-primary w-full py-2 mt-3 text-white" id="changeStatus">Change Status</button>
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
      //Call for info
      const callInfo = document.getElementById("call-for-info");
      callInfo.addEventListener("click", () => {
        alert("Call For Info \n 0322008282 or +233 54 855 4216");
      });

      // Change Plot Price
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

    //Express interest
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

    //Buy Plot
    google.maps.event.addListener(infoWindow, "domready", () => {
      const Btn = document.getElementById("buyPlot");
      Btn.addEventListener("click", () => {
        const id = Btn.getAttribute("data-id");
        setBuyPlotDialog(true);
        setBuyPlotId(id);

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
            parsedData = { ...parsedData, location, table_name };
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

    //Change Status
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

  function getColorBasedOnStatus(status, amount) {
    if (Number(amount) > 0) {
      if (status === null || status === "Available" || status === undefined) {
        return "green";
      } else if (status === "Reserved") {
        return "black";
      } else if (status === "Sold") {
        return "red";
      } else if (status === "On Hold") {
        return "grey"; // Optional: handle unexpected status values
      }
    } else if (Number(amount) === 0 && status === "Sold") {
      return "red";
    } else if (
      (Number(amount) === 0 && status === null) ||
      status === "Available" ||
      status === undefined
    ) {
      return "darkblue";
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
      //isNaN(newAmount) || newAmount <= 0
      if (isNaN(newAmount)) {
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
    if (path === "/saadi-gated-commnunity") {
      database = "saadi";
    }
    if (path === "/trabuom") {
      database = "trabuom";
    }
    if (path === "/berekuso") {
      database = "berekuso";
    }
    if (path === "/royal-court-estate") {
      database = "saadi";
    }
    if (path === "/asokore-mampong") {
      database = "asokore_mampong";
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

  const handleInput = (event) => {
    const charCode = event.which ? event.which : event.keyCode;
    // Prevent input if the key is not a number (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  };

  const handleSaveNewStatus = async () => {
    setStatusLoading(true);
    try {
      const { data, error } = await supabase
        .from(table_name)
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
      setNewStatus("");
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
      <div className="w-full flex flex-col items-center justify-center relative px-10 md:px-14">
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
                  <span className="font-semibold text-sm">Plot Details: </span>
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

        <div className="w-full z-10 flex md:hidden flex-col items-center mb-4 bg-white/90 rounded-md p-3 shadow-md">
          <div className="flex w-full flex-row items-center justify-center mb-2">
            <div className="flex w-full items-center space-x-3">
              <div className="w-4 h-4 bg-green-800 rounded-sm opacity-40"></div>
              <span>Available</span>
            </div>
            <div className="flex w-full items-center space-x-3">
              <div className="w-4 h-4 bg-black rounded-sm opacity-40"></div>
              <span>Reserved</span>
            </div>
            <div className="flex w-full items-center space-x-3">
              <div className="w-4 h-4 bg-red-600 rounded-sm opacity-40"></div>
              <span>Sold</span>
            </div>
          </div>
          <div className="text-xs text-gray-600 text-center border-t border-gray-200 pt-2 w-full">
            Click on available plot to make purchase
          </div>
        </div>

        {/* Main map container with the map-container class for fullscreen functionality */}
        <div className="map-container relative w-full">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              fullscreenControl: false, // We'll implement our own
              streetViewControl: true,
              mapTypeControl: false, // We'll implement our own
              zoomControl: false, // We'll implement our own
              scrollwheel: true,
              gestureHandling: "greedy", // Makes the map easier to use on mobile
              mapTypeId: mapType,
            }}
            className="relative"
          >
            {/* Roads - Saadi  */}
            {/* {
              saadiRoad.map((feature,  i) => (
                <StreetLine key={i} feature={feature} />
              ))
            } */}

            {/* Legend overlay */}
            <div className="absolute w-48 top-20 left-0 bg-white/90 shadow-md rounded-md z-10 hidden md:flex md:flex-col justify-center items-center">
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
              <div className="flex gap-3 w-full items-center pl-2 mt-2">
                <div className="w-4 h-4 bg-red-600 rounded-sm"></div>
                <span>Sold</span>
              </div>
              <div className="px-2 py-3 text-xs text-gray-600 text-center border-t border-gray-200 mt-2 w-full">
                Click on available plot to make purchase
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
                        mapType === "roadmap" ? "bg-blue-50 text-blue-600" : ""
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
                        mapType === "terrain" ? "bg-blue-50 text-blue-600" : ""
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

            {/* Plot polygons */}
            {parcels?.map((feature, index) => (
              <React.Fragment key={index}>
                <Polygon
                  path={asCoordinates(feature.geometry?.coordinates[0])}
                  options={{
                    // Fill color with status-based colors and 0.4 opacity
                    fillColor: getColorBasedOnStatus(
                      feature.status,
                      feature.plotTotalAmount
                    ),
                    fillOpacity: 0.25,
                    strokeWeight: 2,
                    strokeColor: getColorBasedOnStatus(
                      feature.status,
                      feature.plotTotalAmount
                    ),
                  }}
                  onClick={() =>
                    handleInfo(
                      feature.geometry?.coordinates[0],
                      feature.properties?.Plot_No,
                      feature.properties?.Street_Nam,
                      feature.id,
                      feature.plotTotalAmount,
                      feature.status,
                      feature
                    )
                  }
                />

                {map &&
                  markerInfo(
                    feature.geometry.coordinates[0],
                    feature.properties.Plot_No,
                    feature.status
                  )}
              </React.Fragment>
            ))}
          </GoogleMap>

          {/* Mobile-friendly bottom navigation bar (visible on smaller screens) */}
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

          {/* Mobile map type menu (slides up from bottom) */}
          {isMapTypeMenuOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={() => setIsMapTypeMenuOpen(false)}
            >
              <div
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-medium mb-3">Map Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => changeMapType("roadmap")}
                    className={`p-3 rounded-lg flex flex-col items-center border ${
                      mapType === "roadmap"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <span className="mb-1">Road</span>
                    <div className="w-10 h-10 bg-gray-100 rounded-md"></div>
                  </button>
                  <button
                    onClick={() => changeMapType("satellite")}
                    className={`p-3 rounded-lg flex flex-col items-center border ${
                      mapType === "satellite"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <span className="mb-1">Satellite</span>
                    <div className="w-10 h-10 bg-gray-700 rounded-md"></div>
                  </button>
                  <button
                    onClick={() => changeMapType("hybrid")}
                    className={`p-3 rounded-lg flex flex-col items-center border ${
                      mapType === "hybrid"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <span className="mb-1">Hybrid</span>
                    <div className="w-10 h-10 bg-gray-800 rounded-md border border-white"></div>
                  </button>
                  <button
                    onClick={() => changeMapType("terrain")}
                    className={`p-3 rounded-lg flex flex-col items-center border ${
                      mapType === "terrain"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <span className="mb-1">Terrain</span>
                    <div className="w-10 h-10 bg-green-100 rounded-md"></div>
                  </button>
                </div>
                <button
                  onClick={() => setIsMapTypeMenuOpen(false)}
                  className="mt-4 w-full p-3 bg-primary text-white rounded-lg font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status bar below map */}
        <div className="w-full bg-white shadow-md rounded-md mt-2 p-2 text-sm flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Navigation size={16} className="text-gray-500" />
            <span>
              {location} • {parcels?.length || 0} plots available
            </span>
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

        {/* Buy Plot Dialog */}
        {buyPlotDialog && (
          <BuyPlotDialog
            open={buyPlotDialog}
            onOpenChange={setBuyPlotDialog}
            setBuyPlotDialog={setBuyPlotDialog}
            plotId={buyPlotId}
            table={table}
          />
        )}

        {/* Status Dialog */}
        <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
          <DialogTrigger asChild></DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Change Plot Status</DialogTitle>
              <DialogDescription className="flex items-center gap-4 text-gray-800 text-sm">
                <span className="font-semibold text-sm">
                  Select new status for this plot.
                </span>
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
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="">Select status</option>
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSaveNewStatus}
                type="button"
                disabled={!newStatus || statusLoading}
              >
                {statusLoading ? (
                  <Loader className="animate-spin" />
                ) : (
                  "Save Status"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </GoogleMapsProvider>
  );
};

export default Map;
