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
  EnvelopeOpenIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolidIcon,
  EnvelopeIcon as EnvelopeSolidIcon,
} from "@heroicons/react/24/solid";
import {
  GoogleMap,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import GoogleMapsProvider from "@/providers/google-map-provider";
import usePropertyStore from "@/store/usePropertyStore";
import { favoriteToasts } from "@/utils/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tag, Ruler, Bed, Bath, Calendar, CheckCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import OverviewTab from "@/app/_components/property/OverviewTab";
import DetailsTab from "@/app/_components/property/DetailsTab";
import FeaturesTab from "@/app/_components/property/FeaturesTab";
import LocationTab from "@/app/_components/property/LocationTab";
import SimilarProperties from "@/app/_components/property/SimilarProperties";
import DocumentsTab from "@/app/_components/property/DocumentsTab";
import { supabase } from "@/utils/supabase/client";

// Form validation schema
const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function PropertyPage() {
  const {
    selectedProperty,
    similarProperties,
    loading,
    error,
    fetchPropertyById,
    fetchSimilarProperties,
  } = usePropertyStore();
  const toggleFavorite = usePropertyStore((state) => state.toggleFavorite);
  const isFavorite = usePropertyStore((state) =>
    selectedProperty ? state.isFavorite(selectedProperty.id) : false
  );
  const { user } = useUser();

  const [selectedImage, setSelectedImage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [directions, setDirections] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [startLocation, setStartLocation] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);
  const searchInputRef = useRef(null);
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(inquirySchema),
  });

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 800);

    try {
      const result = await toggleFavorite(selectedProperty.id, user?.id);

      if (result.success) {
        if (result.isFavorite) {
          // Property was added to favorites
          toast({
            title: "Added to Favorites",
            description: selectedProperty.title,
            variant: "default",
          });
        } else {
          // Property was removed from favorites
          toast({
            title: "Removed from Favorites",
            description: selectedProperty.title,
            variant: "default",
          });
        }
      } else {
        // Handle error case
        toast({
          title: "Error",
          description: result.message || "Could not update favorites",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Could not update favorites",
        variant: "destructive",
      });
    }
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      navigator
        .share({
          title: selectedProperty.title,
          text: `Check out this ${selectedProperty.type} in ${
            selectedProperty.location
          } for GHS ${selectedProperty.price.toLocaleString()}`,
          url: window.location.href,
        })
        .catch((error) => {
          console.error("Error sharing:", error);
          toast({
            title: "Error",
            description: "Could not share property",
            variant: "destructive",
          });
        });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          toast({
            title: "Link Copied",
            description: "Property link copied to clipboard",
            variant: "default",
          });
        })
        .catch(() => {
          toast({
            title: "Error",
            description: "Could not copy link",
            variant: "destructive",
          });
        });
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
    if (status === "OK") {
      setDirections(result);
    } else {
      console.error("Directions request failed due to " + status);
    }
  };

  const calculateRoute = (origin) => {
    if (!selectedProperty?.location_coordinates) {
      console.warn("No property coordinates available");
      return;
    }

    setIsCalculatingRoute(true);
    const destination = {
      lat: selectedProperty.location_coordinates.coordinates[0],
      lng: selectedProperty.location_coordinates.coordinates[1],
    };

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        setIsCalculatingRoute(false);
        if (status === "OK") {
          setDirections(result);
        } else {
          console.error("Directions request failed due to " + status);
        }
      }
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
      lng: place.geometry.location.lng(),
    };

    // Update the input value with the selected place's formatted address
    setStartLocation(place.formatted_address);

    // Calculate route
    calculateRoute(origin);
  };

  useEffect(() => {
    if (!searchInputRef.current || !window.google) return;

    const options = {
      types: ["geocode", "establishment"],
      componentRestrictions: { country: "gh" },
    };

    const autocompleteInstance = new window.google.maps.places.Autocomplete(
      searchInputRef.current,
      options
    );

    autocompleteInstance.addListener("place_changed", handlePlaceSelect);
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
            lng: position.coords.longitude,
          };

          // Update the search input with current location
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: origin }, (results, status) => {
            if (status === "OK" && results[0]) {
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

      // First insert the inquiry
      const { data: inquiry, error: inquiryError } = await supabase
        .from("property_inquiries")
        .insert([
          {
            property_id: selectedProperty.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            message: data.message,
          },
        ])
        .select()
        .single();

      if (inquiryError) throw inquiryError;

      // Then create a notification for the property owner
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          type: "property_interest",
          user_id: selectedProperty.user_id,
          property_id: selectedProperty.id,
          details: `New inquiry from ${data.name} for your property "${selectedProperty.title}"`,
          status: "pending",
          data: {
            inquiry_id: inquiry.id,
            inquirer_name: data.name,
            inquirer_email: data.email,
            inquirer_phone: data.phone,
            message: data.message
          }
        });

      if (notificationError) throw notificationError;

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
            <p className="text-lg text-gray-600 mb-6">
              {selectedProperty?.location}
            </p>

            {/* Property image gallery */}
            <div className="mb-6">
              <div className="relative h-96 rounded-lg overflow-hidden mb-2">
                <img
                  src={selectedProperty?.images[selectedImage]}
                  alt={selectedProperty?.title}
                  className="w-full h-full object-cover"
                />

                {/* Image navigation buttons (only if more than one image) */}
                {selectedProperty?.images &&
                  selectedProperty.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedImage((prev) =>
                            prev === 0
                              ? selectedProperty.images.length - 1
                              : prev - 1
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
                            prev === selectedProperty.images.length - 1
                              ? 0
                              : prev + 1
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
                  {selectedProperty?.listing_type === "airbnb"
                    ? "Airbnb for short stay"
                    : selectedProperty?.type === "house"
                    ? `House for ${
                        selectedProperty.listing_type === "rent" ? "Rent" : "Sale"
                      }`
                    : `Land for ${
                        selectedProperty?.listing_type === "rent" ? "Rent" : "Sale"
                      }`}
                </div>
              </div>

              {/* Thumbnail images */}
              {selectedProperty?.images &&
                selectedProperty?.images.length > 1 && (
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
                          alt={`${selectedProperty?.title} - image ${
                            index + 1
                          }`}
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
                  {selectedProperty?.listing_type === "rent" ? (
                    <>
                      GHS{" "}
                      {Number(selectedProperty?.rental_price).toLocaleString()}
                      <span className="text-sm text-gray-500">/month</span>
                    </>
                  ) : selectedProperty?.listing_type === "airbnb" ? (
                    <>
                      GHS{" "}
                      {Number(selectedProperty?.rental_price).toLocaleString()}
                      <span className="text-sm text-gray-500">/day</span>
                    </>
                  ) : (
                    <>GHS {Number(selectedProperty?.price).toLocaleString()}</>
                  )}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleFavoriteClick}
                    className={`flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md ${
                      isAnimating ? "scale-125" : ""
                    }`}
                  >
                    {isFavorite ? (
                      <HeartSolidIcon
                        className={`h-5 w-5 text-red-500 ${
                          isAnimating ? "animate-pulse" : ""
                        }`}
                      />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleShareClick}
                    className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md"
                  >
                    <ShareIcon className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="pt-4">
                  <OverviewTab property={selectedProperty} />
                </TabsContent>

                <TabsContent value="details" className="pt-4">
                  <DetailsTab property={selectedProperty} />
                </TabsContent>

                <TabsContent value="features" className="pt-4">
                  <FeaturesTab property={selectedProperty} />
                </TabsContent>

                <TabsContent value="location" className="pt-4">
                  <LocationTab 
                    property={selectedProperty}
                    directions={directions}
                    startLocation={startLocation}
                    setStartLocation={setStartLocation}
                    searchInputRef={searchInputRef}
                    getCurrentLocation={getCurrentLocation}
                    calculateRoute={calculateRoute}
                    isCalculatingRoute={isCalculatingRoute}
                  />
                </TabsContent>

                <TabsContent value="documents" className="pt-4">
                  <DocumentsTab property={selectedProperty} />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right column - contact form and similar properties */}
          <div className="lg:w-1/3">
            {/* Contact form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Interested in this property?
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.message.message}
                    </p>
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
                  <h4 className="font-medium">
                    {selectedProperty?.user_email}
                  </h4>
                  <p className="text-sm text-gray-600 font-medium">
                    Admin (Get One Plot)
                  </p>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <a
                  href={`tel:${selectedProperty?.contact}`}
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
                  {`0${selectedProperty?.contact}`}
                </a>
                <a
                  href={`mailto:${selectedProperty?.user_email}`}
                  className="flex items-center text-gray-700 hover:text-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-primary"
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
                  {selectedProperty?.user_email}
                </a>
              </div>
            </div>

            {/* Similar properties */}
            <SimilarProperties similarProperties={similarProperties} />
          </div>
        </div>
      </main>
      <Footer />
    </GoogleMapsProvider>
  );
}
