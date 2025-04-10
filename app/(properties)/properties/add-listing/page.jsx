"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import { Stepper } from "./_components/stepper";
import PropertyDetailsForm from "./_components/property-details-form";
import LocationForm from "./_components/location-from";
import ImagesForm from "./_components/images-form";
import PricingForm from "./_components/pricing-form";
import FeaturesForm from "./_components/features-form";
import ReviewSubmit from "./_components/review-submit";

export default function AddListingPage() {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "house", // default to house
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
    user_email: user?.emailAddresses[0]?.emailAddress || "", // Add user email
    region: "" // Add region field
  });
  
  const totalSteps = 6;
  
  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };
  
  const nextStep = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };
  
  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <main className="w-full md:w-[85%] lg:w-[90%] max-w-6xl mx-auto px-4 sm:px-6 py-16 min-h-screen mt-1 mb-16">
        <h1 className="text-3xl font-bold text-center mb-10">Add New Property Listing</h1>
        
        <div className="mb-10">
          <Stepper 
            steps={[
              "Property Details", 
              "Location", 
              "Images", 
              "Pricing", 
              "Features", 
              "Review"
            ]} 
            currentStep={step} 
          />
        </div>
        
        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 md:p-10">
          <div className="min-h-[500px]"> {/* Added fixed minimum height container */}
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
              <ReviewSubmit 
                formData={formData} 
                prevStep={prevStep} 
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}