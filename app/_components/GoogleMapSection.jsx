"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Polygon,
  useJsApiLoader,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import mapboxgl from "mapbox-gl";
import MarkerItem from "./MarkerItem";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-toastify";
import { Loader } from "lucide-react";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const GoogleMapSection = ({ searchedCoordinates, listing, images }) => {
  const [center, setCenter] = useState({
    lat: 6.666254591975245,
    lng: -1.6611130754452268,
  });

  const [locationAdd, setLocationAdd] = useState();
  const [locationCord, setLocationCord] = useState();
  const [directions, setDirections] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [showDirectionsInput, setShowDirectionsInput] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [directionDet, setDirectionDet] = useState(false);
  const [time, setTime] = useState();
  const [distace, setDistance] = useState();

  const productLocation = {
    lat: listing[0]?.coordinates.lat,
    lng: listing[0]?.coordinates.lng,
  };

  const handleGetDirections = () => {
    if (useCurrentLocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition((position) => {
        if (position.coords) {
          directionsService.route(
            {
              origin: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
              destination: productLocation,
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (response) => {
              if (response.status === "OK") {
                setIsLoading(false);
                setDirections(response);
                let directionDistance =
                  response.routes[0].legs[0].distance.value; //in meters
                let directionTime = response.routes[0].legs[0].duration.value; //in seconds
                directionDistance = Math.floor(
                  (directionDistance / 1000) * 0.89
                );
                directionTime = Math.floor((directionTime / 60) * 0.89);

                if (directionDistance <= 0) {
                  setDistance("Less than 1");
                } else {
                  setDistance(directionDistance);
                }

                if (directionTime <= 0) {
                  setTime("Less than 1");
                } else {
                  setTime(directionTime);
                }
                setDirectionDet(true);
              }
            }
          );
        } else {
          setIsLoading(false);
          toast.error("Sorry Error getting direction. \nTry again later");
        }
      });
    } else if (locationCord) {
      setIsLoading(true);
      directionsService.route(
        {
          origin: locationCord,
          destination: productLocation,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (response) => {
          if (response.status === "OK") {
            setIsLoading(false);
            setDirections(response);
            let directionDistance = response.routes[0].legs[0].distance.value; //in meters
            let directionTime = response.routes[0].legs[0].duration.value; //in seconds
            directionDistance = Math.floor((directionDistance / 1000) * 0.89);
            directionTime = Math.floor((directionTime / 60) * 0.89);

            if (directionDistance <= 0) {
              setDistance("Less than 1");
            } else {
              setDistance(directionDistance);
            }

            if (directionTime <= 0) {
              setTime("Less than 1");
            } else {
              setTime(directionTime);
            }
            setDirectionDet(true);
          }
          if (response.status === "ZERO_RESULTS") {
            setIsLoading(false);
            toast.error(
              "Sorry Error getting directions. \nTry again with different location closer"
            );
          }
        }
      );
    } else {
      setIsLoading(false);
      toast.error("Sorry Error getting direction. \nTry again later");
    }

    setShowDirectionsInput(true);
  };

  const directionsService = new google.maps.DirectionsService();

  useEffect(() => {
    searchedCoordinates && setCenter(searchedCoordinates);
  }, [searchedCoordinates]);

  const [map, setMap] = useState(null);

  const zoom = 13;

  const { isLoaded, i } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  });

  const onLoad = useCallback(
    function callback(map) {
      const bounds = new window.google.maps.LatLngBounds(center);
      map.fitBounds(bounds);

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

  return (
    <div className="shadow-md w-full relative mb-12" id="locationContainer">
      <div
        id="locate"
        style={{ display: "none" }}
        className="my-4  flex flex-col space-y-2 lg:px-36 md:px-24 px-10 xl:px-36"
      >
        <GooglePlacesAutocomplete
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY}
          selectProps={{
            placeholder: "Search Start Location",
            isClearable: true,
            className: "w-full mb-6",
            onChange: (place) => {
              setLocationAdd(place?.label);
              geocodeByAddress(place?.label)
                .then((result) => getLatLng(result[0]))
                .then(({ lat, lng }) => {
                  setLocationCord({ lat, lng });
                  setUseCurrentLocation(false);
                });

              if (place === null) {
                console.log("No place");
                //setUseCurrentLocation(true)
              }
            },
          }}
        />
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={useCurrentLocation}
            onCheckedChange={(e) => setUseCurrentLocation(e)}
            id="curren-location"
          />
          <label
            htmlFor="curren-location"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Current Location
          </label>
        </div>

        <button
          onClick={handleGetDirections}
          style={{ margin: "1rem 0" }}
          className="px-4 py-2 bg-primary/90 text-white rounded hover:bg-primary"
        >
          Get Direction
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        gestureHandling="greedy"
        className="relative mb-6"
      >
        {isLoading && (
          <div className="absolute w-full h-full bg-black/60 pt-[8rem]">
            <div className="flex flex-col justify-center items-center">
              <Loader className="animate-spin" />
            </div>
          </div>
        )}

        {directionDet && (
          <div
            id="distainceDetails"
            className="absolute w-40 top-20 left-0 bg-white/90 shadow-md"
          >
            <div className="flex gap-3 max-w-36 justify-between items-center pl-2 pt-3">
              <span>Distance: </span>
              <span className="font-semibold text-right">{`${distace}Km`}</span>
            </div>
            <div className="flex gap-3 max-w-36 justify-between items-center pl-2 mt-2">
              <span>Time: </span>
              <span className="font-semibold text-right">{` ${time} ${
                time > 1 ? "minutes" : "minute"
              }`}</span>
            </div>
            <div className="flex gap-3 max-w-36 justify-between items-center pl-2 mt-2 pb-3">
              Mode:
              <span className="font-semibold text-right">Driving</span>
            </div>
          </div>
        )}
        <div className="relative z-50">
          {listing.map((item, index) => (
            <MarkerItem key={index} item={item} images={images} />
          ))}
        </div>

        {directions && (
          <DirectionsRenderer
            options={{
              directions: directions,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

const mapContainerStyle = {
  height: "75vh",
  width: "100%",
  borderRadius: 10,
};

export default GoogleMapSection;
