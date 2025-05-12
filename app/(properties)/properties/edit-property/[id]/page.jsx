"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { Stepper } from "../../add-listing/_components/stepper";
import PropertyDetailsForm from "../../add-listing/_components/property-details-form";
import LocationForm from "../../add-listing/_components/location-from";
import ImagesForm from "../../add-listing/_components/images-form";
import PricingForm from "../../add-listing/_components/pricing-form";
import FeaturesForm from "../../add-listing/_components/features-form";
import EditReviewSubmit from "./_components/edit-review-submit";
import DocumentsForm from "../../add-listing/_components/documents-form";

export default function EditPropertyPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    type: "house",
    title: "",
    description: "",
    bedrooms: 0,
    bathrooms: 0,
    size: "",
    price: "",
    location: "",
    address: "",
    coordinates: null,
    images: [],
    features: [],
    status: "Available",
    negotiable: false,
    property_type: "sale",
    listing_type: "sale",
    rental_type: null,
    rental_duration: null,
    rental_price: null,
    rental_available_from: null,
    rental_available_to: null,
    rental_deposit: null,
    rental_utilities_included: false,
    rental_furnished: false
  });

  const router = useRouter();
  const params = useParams();
  const { user, isSignedIn } = useUser();
  const propertyId = params.id;

  // Fetch the property data when the component mounts
  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", propertyId)
          .single();

        if (error) throw error;

        if (!data) {
          setError("Property not found");
          return;
        }

        // Check if the current user is the owner of the property
        const isOwner = user?.id === data.user_id;
        const isAdmin = user?.publicMetadata?.role === 'admin';
        const isSysAdmin = user?.publicMetadata?.role === 'sysadmin';
        console.log(isSysAdmin);
        
        if (!isOwner && !isAdmin && !isSysAdmin) {
          setError("You don't have permission to edit this property");
          return;
        }

        // Parse coordinates if they exist
        let coordinates = null;
        if (data.location_coordinates) {
          try {
            // Handle different formats of coordinates
            if (
              typeof data.location_coordinates === "string" &&
              data.location_coordinates.includes("POINT")
            ) {
              // Parse from POINT format
              const match = data.location_coordinates.match(
                /POINT\((-?\d+\.?\d*) (-?\d+\.?\d*)\)/,
              );
              if (match) {
                coordinates = {
                  lat: parseFloat(match[1]),
                  lng: parseFloat(match[2]),
                };
              }
            } else if (data.location_coordinates.coordinates) {
              // Handle GeoJSON format
              coordinates = {
                lat: data.location_coordinates.coordinates[0],
                lng: data.location_coordinates.coordinates[1],
              };
            }
          } catch (e) {
            console.error("Error parsing coordinates:", e);
          }
        }

        // Set the form data with the retrieved property data
        setFormData({
          ...data,
          coordinates,
          negotiable: data.negotiable || false,
          property_type: data.property_type || 'sale',
          listing_type: data.listing_type || 'sale',
          type: data.type || 'house'
        });
      } catch (err) {
        console.error("Error fetching property:", err);
        setError(err.message || "Failed to load property data");
      } finally {
        setIsLoading(false);
      }
    };

    if(isSignedIn && user){
      fetchProperty();
    }
    
  }, [propertyId, user]);

  const totalSteps = 6;

  const updateFormData = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <>
        <main className="w-full md:w-[85%] lg:w-[90%] max-w-6xl mx-auto px-4 sm:px-6 py-16 min-h-screen">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading property data...</p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <main className="w-full md:w-[85%] lg:w-[90%] max-w-6xl mx-auto px-4 sm:px-6 py-16 min-h-screen">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium">Error: {error}</p>
            <button
              onClick={() => router.push("/my-properties")}
              className="mt-4 text-primary hover:underline"
            >
              Return to My Properties
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="w-full md:w-[85%] lg:w-[90%] max-w-6xl mx-auto px-4 sm:px-6 py-16 min-h-screen">
        <h1 className="text-3xl font-bold text-center mb-10">
          Edit Property Listing
        </h1>

        <div className="mb-10">
          <Stepper
            steps={[
              "Property Details",
              "Location",
              "Images",
              "Pricing",
              "Features",
              "Review",
            ]}
            currentStep={step}
          />
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 md:p-10">
          <div className="min-h-[500px]">
            {step === 1 && (
              <PropertyDetailsForm
                formData={formData}
                updateFormData={updateFormData}
                nextStep={nextStep}
              />
            )}
            {step === 2 && (
              <LocationForm
                formData={formData}
                updateFormData={updateFormData}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {step === 3 && (
              <ImagesForm
                formData={formData}
                updateFormData={updateFormData}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {step === 4 && (
              <PricingForm
                formData={formData}
                updateFormData={updateFormData}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {step === 5 && (
              <FeaturesForm
                formData={formData}
                updateFormData={updateFormData}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {step === 6 && (
              <DocumentsForm 
                formData={formData} 
                updateFormData={updateFormData} 
                nextStep={nextStep} 
                prevStep={prevStep} 
              />
            )}
            {step === 7 && (
              <EditReviewSubmit
                formData={formData}
                propertyId={propertyId}
                prevStep={prevStep}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
