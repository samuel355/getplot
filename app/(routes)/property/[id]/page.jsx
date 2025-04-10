"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import {
  HeartIcon,
  ShareIcon,
  ArrowLeftIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { GoogleMap, Marker, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import GoogleMapsProvider from "@/providers/google-map-provider";
import usePropertyStore from "@/store/usePropertyStore";
import { favoriteToasts } from "@/utils/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Form validation schema
const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function PropertyPage() {
  const { selectedProperty, similarProperties, loading, error, fetchPropertyById, fetchSimilarProperties } = usePropertyStore();
  const toggleFavorite = usePropertyStore(state => state.toggleFavorite);
  const isFavorite = usePropertyStore(state => 
    selectedProperty ? state.isFavorite(selectedProperty.id) : false
  );
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [directions, setDirections] = useState(null);
  const [startLocation, setStartLocation] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);
  const searchInputRef = useRef(null);
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(inquirySchema),
  });

  const handleFavoriteToggle = () => {
    if (!selectedProperty) return;
    
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
    
    const result = toggleFavorite(selectedProperty.id);
    
    if (result.success) {
      if (result.isFavorite) {
        favoriteToasts.addedToFavorites({
          title: selectedProperty.title,
          image: selectedProperty.images[0]
        });
      } else {
        favoriteToasts.removedFromFavorites({
          title: selectedProperty.title
        });
      }
    } else {
      favoriteToasts.error(result.message || 'Could not update favorites');
    }
  };
  
  
  useEffect(() => {
    const loadProperty = async () => {
      const property = await fetchPropertyById(params.id);
      if (property) {
        fetchSimilarProperties(property);
      } else {
        // Property not found or error
        router.push("/market-place");
      }
    };

    loadProperty();
    
    // Cleanup function
    return () => {
      // Reset selected property when unmounting
      usePropertyStore.getState().selectedProperty = null;
    };
  }, [params.id, router, fetchPropertyById, fetchSimilarProperties]);
 

  const handleDirectionsRequest = (result, status) => {
    if (status === 'OK') {
      setDirections(result);
    } else {
      console.error('Directions request failed due to ' + status);
    }
  };

  const calculateRoute = (origin) => {
    if (!selectedProperty?.location_coordinates) return;

    const destination = {
      lat: selectedProperty.location_coordinates.coordinates[0],
      lng: selectedProperty.location_coordinates.coordinates[1]
    };

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      handleDirectionsRequest
    );
  };

  const handlePlaceSelect = () => {
    if (!autocomplete) return;
    
    const place = autocomplete.getPlace();
    if (!place.geometry) {
      console.warn("No details available for input: '" + place.name + "'");
      return;
    }

    const origin = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };

    // Update the input value with the selected place's formatted address
    setStartLocation(place.formatted_address);
    
    // Calculate route
    calculateRoute(origin);
  };

  useEffect(() => {
    if (!searchInputRef.current || !window.google) return;

    const options = {
      types: ['geocode', 'establishment'],
      componentRestrictions: { country: 'gh' }
    };

    const autocompleteInstance = new window.google.maps.places.Autocomplete(
      searchInputRef.current,
      options
    );

    autocompleteInstance.addListener('place_changed', handlePlaceSelect);
    setAutocomplete(autocompleteInstance);

    // Cleanup
    return () => {
      if (autocompleteInstance) {
        window.google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [searchInputRef.current, window.google]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const origin = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Update the search input with current location
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: origin }, (results, status) => {
            if (status === 'OK' && results[0]) {
              setStartLocation(results[0].formatted_address);
            }
          });

          // Calculate route
          calculateRoute(origin);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const { error } = await usePropertyStore.getState().supabase
        .from("property_inquiries")
        .insert([
          {
            property_id: selectedProperty.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            message: data.message,
          },
        ]);

      if (error) throw error;

      setSubmitSuccess(true);
      reset();
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      setSubmitError("Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <GoogleMapsProvider>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
          <div className="animate-pulse">
            <div className="h-8 w-1/2 bg-gray-200 rounded mb-6"></div>
            <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded mb-8"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </main>
        <Footer />
      </GoogleMapsProvider>
    );
  }

  return (
    <GoogleMapsProvider>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen w-full mt-20">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-primary"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to search results
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - property images and details */}
          <div className="lg:w-2/3">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedProperty?.title}
            </h1>
            <p className="text-lg text-gray-600 mb-6">{selectedProperty?.location}</p>

            {/* Property image gallery */}
            <div className="mb-6">
              <div className="relative h-96 rounded-lg overflow-hidden mb-2">
                <img
                  src={selectedProperty?.images[selectedImage]}
                  alt={selectedProperty?.title}
                  className="w-full h-full object-cover"
                />

                {/* Image navigation buttons (only if more than one image) */}
                {selectedProperty?.images && selectedProperty.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImage((prev) =>
                          prev === 0 ? selectedProperty.images.length - 1 : prev - 1,
                        )
                      }
                      className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                      aria-label="Previous image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 19.5L8.25 12l7.5-7.5"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImage((prev) =>
                          prev === selectedProperty.images.length - 1 ? 0 : prev + 1,
                        )
                      }
                      className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                      aria-label="Next image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </button>
                  </>
                )}

                {/* Type badge */}
                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-md font-medium">
                  {selectedProperty?.type === "house" ? "House" : "Land"}
                </div>
              </div>

              {/* Thumbnail images */}
              {selectedProperty?.images && selectedProperty?.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {selectedProperty?.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-24 h-16 rounded-md overflow-hidden ${
                        selectedImage === index
                          ? "ring-2 ring-primary"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${selectedProperty?.title} - image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-primary">
                  ${selectedProperty?.price.toLocaleString()}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md"
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                    <span>Save</span>
                  </button>
                  <button className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md">
                    <ShareIcon className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              <div className="border-b pb-4 mb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-2">
                  <div>
                    <p className="text-gray-500 text-sm">Property Type</p>
                    <p className="font-semibold capitalize">{selectedProperty?.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Property Size</p>
                    <p className="font-semibold">{selectedProperty?.size}</p>
                  </div>
                  {selectedProperty?.type === "house" && (
                    <>
                      <div>
                        <p className="text-gray-500 text-sm">Bedrooms</p>
                        <p className="font-semibold">{selectedProperty?.bedrooms}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Bathrooms</p>
                        <p className="font-semibold">{selectedProperty?.bathrooms}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-gray-500 text-sm">Listed</p>
                    <p className="font-semibold">
                      {new Date(selectedProperty?.created_at || selectedProperty?.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 mb-4">{selectedProperty?.description}</p>

                {selectedProperty?.features && selectedProperty?.features.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mb-2">Features</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedProperty?.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <svg
                            className="h-5 w-5 text-primary mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Location map - GOOGLE MAPS */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Location</h3>
              {selectedProperty?.location_coordinates && (
                <>
                  <div className="mb-4 flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Enter your starting location"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={startLocation}
                        onChange={(e) => setStartLocation(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={getCurrentLocation}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                      <MapPinIcon className="h-5 w-5" />
                      <span>Use Current Location</span>
                    </button>
                  </div>
                  <div className="h-80 rounded-lg overflow-hidden">
                    <GoogleMap
                      mapContainerStyle={{ height: "100%", width: "100%" }}
                      center={{
                        lat: selectedProperty?.location_coordinates.coordinates[0],
                        lng: selectedProperty?.location_coordinates.coordinates[1]
                      }}
                      zoom={15}
                      options={{
                        fullscreenControl: false,
                        streetViewControl: true,
                        mapTypeControl: false,
                        zoomControl: true,
                      }}
                    >
                      <Marker
                        position={{
                          lat: selectedProperty?.location_coordinates.coordinates[0],
                          lng: selectedProperty?.location_coordinates.coordinates[1]
                        }}
                      />
                      {directions && <DirectionsRenderer directions={directions} />}
                    </GoogleMap>
                  </div>
                </>
              )}
            </div>

            {/* Below the location map section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Nearby Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Shopping</h4>
                    <p className="text-sm text-gray-600">Within 2km</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Schools</h4>
                    <p className="text-sm text-gray-600">Within 3km</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Power Supply</h4>
                    <p className="text-sm text-gray-600">Available</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Road Access</h4>
                    <p className="text-sm text-gray-600">Good Condition</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - contact form and similar properties */}
          <div className="lg:w-1/3">
            {/* Contact form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Interested in this property?</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register("name")}
                      type="text"
                      id="name"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Enter your name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register("email")}
                      type="email"
                      id="email"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register("phone")}
                      type="tel"
                      id="phone"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    {...register("message")}
                    id="message"
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="I'm interested in this property"
                    defaultValue={`I'm interested in this property: ${selectedProperty?.title}`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                {submitError && (
                  <div className="text-red-600 text-sm">{submitError}</div>
                )}

                {submitSuccess && (
                  <div className="text-green-600 text-sm">
                    Thank you for your interest! We'll contact you soon.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            {/* Agent/Company info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Listed By</h3>
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                  <img
                    src="/logo.png"
                    alt="Company Logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">Ghana Estates Ltd</h4>
                  <p className="text-sm text-gray-600">
                    Premium Land & Property
                  </p>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <a
                  href="tel:+233201234567"
                  className="flex items-center text-gray-700 hover:text-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  +233 20 123 4567
                </a>
                <a
                  href="mailto:info@ghanaestates.com"
                  className="flex items-center text-gray-700 hover:text-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  info@ghanaestates.com
                </a>
                <a
                  href="https://www.ghanaestates.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-700 hover:text-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  www.ghanaestates.com
                </a>
              </div>
            </div>

            {/* Similar properties - UPDATED TO USE DATA FROM SUPABASE */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Similar Properties</h3>
              <div className="space-y-4">
                {similarProperties.length > 0 ? (
                  similarProperties.map((similarProperty) => (
                    <Link
                      key={similarProperty.id}
                      href={`/property/${similarProperty.id}`}
                      className="flex gap-3 group"
                    >
                      <div className="h-16 w-20 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={similarProperty?.images[0]}
                          alt={similarProperty.title}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-200"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-medium text-gray-900 truncate group-hover:text-primary">
                          {similarProperty.title}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">
                          {similarProperty.location}
                        </p>
                        <p className="text-primary font-semibold text-sm">
                          ${similarProperty.price.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500">No similar properties found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </GoogleMapsProvider>
  );
}