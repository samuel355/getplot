"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ReviewSubmit({ formData, prevStep }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("You must be logged in to submit a listing");
        return;
      }
      
      // Prepare data for insertion
      const listingData = {
        ...formData,
        user_id: user.id,
        created_at: new Date(),
        status: "pending", // Requires approval if you want moderation
        location_coordinates: formData.coordinates ? 
          `POINT(${formData.coordinates.lng} ${formData.coordinates.lat})` : null,
      };
      
      // Remove the coordinates object as we've transformed it
      delete listingData.coordinates;
      
      // Insert into database
      const { data, error: insertError } = await supabase
        .from('properties')
        .insert(listingData)
        .select();
        
      if (insertError) throw insertError;
      
      // Redirect to success page or listing detail
      router.push(`/listing-success?id=${data[0].id}`);
      
    } catch (err) {
      console.error("Error submitting listing:", err);
      setError("Failed to submit your listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Review Your Listing</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="font-medium text-lg mb-4">Property Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Property Type</p>
            <p className="capitalize">{formData.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Title</p>
            <p>{formData.title}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Description</p>
            <p>{formData.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Size</p>
            <p>{formData.size}</p>
          </div>
          
          {formData.type === "house" && (
            <>
              <div>
                <p className="text-sm text-gray-500">Bedrooms</p>
                <p>{formData.bedrooms}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bathrooms</p>
                <p>{formData.bathrooms}</p>
              </div>
            </>
          )}
        </div>
        
        <h3 className="font-medium text-lg mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Location/Area</p>
            <p>{formData.location}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Address</p>
            <p>{formData.address}</p>
          </div>
        </div>
        
        <h3 className="font-medium text-lg mb-4">Images</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {formData.images.map((image, index) => (
            <div key={index} className="overflow-hidden rounded-lg h-32 bg-gray-100">
              <img 
                src={image.url} 
                alt={`Property image ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        
        <h3 className="font-medium text-lg mb-4">Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p>₵{formData.price} {formData.negotiable ? "(Negotiable)" : ""}</p>
          </div>
        </div>
        
        <h3 className="font-medium text-lg mb-4">Features</h3>
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <span 
                key={index} 
                className="bg-primary-light text-primary px-3 py-1 rounded-full text-sm"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={prevStep}
          className="border border-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-50 transition duration-300"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`py-2 px-6 rounded-md transition duration-300 ${
            isSubmitting 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-primary text-white hover:bg-primary-dark'
          }`}
        >
          {isSubmitting ? (
            <>
              <span className="inline-block animate-spin mr-2">⟳</span>
              Submitting...
            </>
          ) : (
            "Submit Listing"
          )}
        </button>
      </div>
    </div>
  );
}