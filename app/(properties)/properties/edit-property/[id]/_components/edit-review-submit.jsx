"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function EditReviewSubmit({ formData, propertyId, prevStep }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { toast } = useToast();
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare data for update
      const updateData = {
        ...formData,
        updated_at: new Date(),
        // If the status was approved, set it to 'pending' to indicate it needs approval again
        status: formData.status === 'approved' ? 'pending' : formData.status,
        location_coordinates: formData.coordinates ? 
          `POINT(${formData.coordinates.lat} ${formData.coordinates.lng})` : null,
      };
      
      // Remove the coordinates object as we've transformed it
      delete updateData.coordinates;
      // Remove the id, as we are using it in the condition
      delete updateData.id;
      
      // Update the property
      const { data, error: updateError } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId)
        .select();
      
      if (updateError) throw updateError;
      
      toast({
        title: "Success!",
        description: "Your property has been updated successfully",
      });
      
      // Redirect to the property detail page
      router.push(`/properties/property/${propertyId}`);
      
    } catch (err) {
      console.error("Error updating property:", err);
      setError("Failed to update your property. Please try again.");
      
      toast({
        title: "Error",
        description: "Failed to update your property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Review Your Changes</h2>
      
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
        
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mt-6">
          <p className="font-medium">⚠️ Important Note</p>
          <p className="text-sm mt-1">Your property will need to be approved again by an administrator after editing.</p>
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
              Updating...
            </>
          ) : (
            "Update Property"
          )}
        </button>
      </div>
    </div>
  );
}