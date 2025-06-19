"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/utils/supabase/client";

export default function ImagesForm({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) {
  const [uploadedImages, setUploadedImages] = useState(formData.images || []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const addLogoToImage = async (file) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Create image from file
      const img = new Image();
      img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the main image
        ctx.drawImage(img, 0, 0);

        // Load and draw the logo
        const logo = new Image();
        logo.onload = () => {
          // Calculate logo size (20% of the smaller dimension)
          const logoSize = Math.min(img.width, img.height) * 0.2;

          // Position logo in top right corner with padding
          const padding = logoSize * 0.2;
          const logoX = canvas.width - logoSize - padding;
          const logoY = padding;

          // Draw logo
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

          // Convert canvas to blob
          canvas.toBlob((blob) => {
            // Create a new file from the blob
            const newFile = new File([blob], file.name, {
              type: file.type,
              lastModified: file.lastModified,
            });
            resolve(newFile);
          }, file.type);
        };
        logo.onerror = reject;
        logo.src = "/logo-lateral.svg";
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length + uploadedImages.length > 10) {
        setError("Maximum 10 images allowed");
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const newImages = [];

        for (const file of acceptedFiles) {
          // Add logo to the image
          const fileWithLogo = await addLogoToImage(file);

          // Create a unique file name
          const fileExt = file.name.split(".").pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `property-images/${fileName}`;

          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from("properties")
            .upload(filePath, fileWithLogo);

          if (error) throw error;

          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from("properties")
            .getPublicUrl(filePath);

          newImages.push({
            path: filePath,
            url: publicUrlData.publicUrl,
            name: file.name,
            size: fileWithLogo.size,
            type: fileWithLogo.type,
          });
        }

        const updatedImages = [...uploadedImages, ...newImages];
        setUploadedImages(updatedImages);
        updateFormData({ images: updatedImages });
      } catch (error) {
        console.error("Error uploading image:", error);
        setError("Failed to upload images. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [uploadedImages, updateFormData]
  );

  const removeImage = async (index) => {
    const imageToRemove = uploadedImages[index];

    try {
      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from("properties")
        .remove([imageToRemove.path]);

      if (error) throw error;

      // Update state
      const updatedImages = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(updatedImages);
      updateFormData({ images: updatedImages });
    } catch (error) {
      console.error("Error removing image:", error);
      setError("Failed to remove image. Please try again.");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
    },
    maxSize: 5242880, // 5MB
  });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Property Images</h2>

      <div className="mb-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition duration-200 ${
            isDragActive
              ? "border-primary bg-blue-50"
              : "border-gray-300 hover:border-primary"
          }`}
        >
          <input {...getInputProps()} />

          {uploading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
              <p>Uploading...</p>
            </div>
          ) : isDragActive ? (
            <p className="text-primary">Drop the images here...</p>
          ) : (
            <div>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2">
                Drag and drop images here, or click to select files
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WEBP up to 5MB (Maximum 10 images)
              </p>
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {uploadedImages.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">Uploaded Images</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="overflow-hidden rounded-lg h-32 bg-gray-100">
                    <img
                      src={image.url}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-700"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>

                  {index === 0 && (
                    <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              The first image will be used as the cover. All images will have
              the logo in the top right corner.
            </p>
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
          type="button"
          onClick={nextStep}
          disabled={uploadedImages.length === 0}
          className={`py-2 px-6 rounded-md transition duration-300 ${
            uploadedImages.length === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary-dark"
          }`}
        >
          Next: Pricing
        </button>
      </div>
    </div>
  );
}
