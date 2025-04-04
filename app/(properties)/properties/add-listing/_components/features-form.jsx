"use client";
import { useState, useEffect } from "react";

// Common features for properties
const commonFeatures = [
  "Electricity", "Water Connection", "Security", "Fenced"
];

// Features specific to houses
const houseFeatures = [
  "Air Conditioning", "Swimming Pool", "Furnished", "Garage",
  "Garden", "Gym", "Balcony", "Parking", "Kitchen", "Internet/Wifi"
];

// Features specific to land
const landFeatures = [
  "Road Access", "Clear Title", "Survey Document", "Building Permit",
  "Commercial Zoning", "Residential Zoning", "Agricultural", "Riverside"
];

export default function FeaturesForm({ formData, updateFormData, nextStep, prevStep }) {
  const [selectedFeatures, setSelectedFeatures] = useState(formData.features || []);
  const [customFeature, setCustomFeature] = useState("");
  
  // Determine which feature set to show based on property type
  const propertySpecificFeatures = formData.type === "house" ? houseFeatures : landFeatures;
  
  const handleFeatureToggle = (feature) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };
  
  const addCustomFeature = () => {
    if (customFeature.trim() && !selectedFeatures.includes(customFeature.trim())) {
      setSelectedFeatures([...selectedFeatures, customFeature.trim()]);
      setCustomFeature("");
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    updateFormData({ features: selectedFeatures });
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-6">Property Features</h2>
      
      <div className="mb-8">
        <h3 className="font-medium mb-3">Common Features</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {commonFeatures.map(feature => (
            <label 
              key={feature} 
              className={`flex items-center p-3 border rounded-md cursor-pointer transition duration-200 ${
                selectedFeatures.includes(feature) 
                  ? 'bg-primary-light border-primary' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-primary"
                checked={selectedFeatures.includes(feature)}
                onChange={() => handleFeatureToggle(feature)}
              />
              <span className="ml-2">{feature}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="font-medium mb-3">
          {formData.type === "house" ? "House Features" : "Land Features"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {propertySpecificFeatures.map(feature => (
            <label 
              key={feature} 
              className={`flex items-center p-3 border rounded-md cursor-pointer transition duration-200 ${
                selectedFeatures.includes(feature) 
                  ? 'bg-primary-light border-primary' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-primary"
                checked={selectedFeatures.includes(feature)}
                onChange={() => handleFeatureToggle(feature)}
              />
              <span className="ml-2">{feature}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-3">Custom Features</h3>
        <div className="flex">
          <input
            type="text"
            value={customFeature}
            onChange={(e) => setCustomFeature(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Add a custom feature"
          />
          <button
            type="button"
            onClick={addCustomFeature}
            className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary-dark transition duration-300"
          >
            Add
          </button>
        </div>
        
        {selectedFeatures.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {selectedFeatures.filter(f => 
                !commonFeatures.includes(f) && 
                !propertySpecificFeatures.includes(f)
              ).map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                >
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleFeatureToggle(feature)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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
          type="submit"
          className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition duration-300"
        >
          Next: Review
        </button>
      </div>
    </form>
  );
}