"use client";
import React, { useCallback, useState } from "react";
import { GoogleMap, Polygon, useJsApiLoader } from "@react-google-maps/api";
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

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const Map = ({ parcels, center }) => {
  const pathname = usePathname();
  const [map, setMap] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [plotID, setPlotID] = useState();
  const path = usePathname();
  const { user } = useUser();
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

  const mapContainerStyle = {
    height: "90vh",
    width: "85%",
  };

  const zoom = path === "/trabuom" ? 15.6 : 17;

  const { isLoaded, i } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  });

  const onLoad = useCallback(
    function callback(map) {
      const bounds = new window.google.maps.LatLngBounds(center);
      map.fitBounds(bounds);

      // map.addListener("idle", () => {
      //   // Check if the current zoom level is less than 16
      //   if (map.getZoom() < 16) {
      //     // Set the zoom level to 16 if it's less than 16
      //     map.setZoom(16);
      //   }else{
      //     map.setZoom(zoom)
      //   }
      // });

      setTimeout(() => {
        map.setZoom(zoom);
        setMap(map);
      }, 1500);
    },
    [map]
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
        color: renderMarkerColor(status),
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
  const handleInfo = (coordinates, text1, text2, id, amount, status) => {
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

          <a style="margin-top: ${
            status === "Reserved" || status === "Sold" ? "7px" : "0"
          }" href="tel:0248838005" id="call-for-info" class="border px-4 py-1 rounded-md text-sm font-normal">
            Call For Info
          </a>

          <p id="expressInterest" style="display: ${
            status === "Sold" || status === "Reserved" ? "none" : "block"
          }" data-id=${id} class="border px-4 cursor-pointer py-1 rounded-md text-sm font-normal mt-1">
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
      const callInfo = document.getElementById('call-for-info');
      callInfo.addEventListener('click', () => {
        alert('Call For Info \n 0322008282 or +233 24 883 8005')
      })
      
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
    if (status === null || status === "Available" || status === undefined) {
      return "green";
    } else if (status === "Reserved") {
      return "black";
    } else if (status === "Sold") {
      return "red";
    } else {
      return "orange"; // Optional: handle unexpected status values
    }
  }

  function renderMarkerColor(status) {
    if (status === null || status === "Available" || status === undefined) {
      return "black";
    } else if (status === "Reserved") {
      return "white";
    } else if (status === "Sold") {
      return "black";
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

  const handleInput = (event) => {
    const charCode = event.which ? event.which : event.keyCode;
    // Prevent input if the key is not a number (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  };

  return (
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
                {loading ? <Loader className="animate-spin" /> : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        className="relative"
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

        {parcels?.map((feature, index) => (
          <>
            <Polygon
              key={index}
              path={asCoordinates(feature.geometry?.coordinates[0])}
              options={{
                fillColor: getColorBasedOnStatus(feature.status),
                fillOpacity: 0.8,
                strokeWeight: 1,
              }}
              onClick={() =>
                handleInfo(
                  feature.geometry?.coordinates[0],
                  feature.properties?.Plot_No,
                  feature.properties?.Street_Nam,
                  feature.id,
                  feature.plotTotalAmount,
                  feature.status
                )
              }
            />

            {markerInfo(
              feature.geometry.coordinates[0],
              feature.properties.Plot_No,
              feature.status
            )}
          </>
        ))}
      </GoogleMap>
      {isDialogOpen && (
        <ExpressInterestDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          plotId={interestPlotId}
          setIsDialogOpen={setIsDialogOpen}
          table={table}
        />
      )}
    </div>
  );
};

export default Map;
