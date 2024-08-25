import { X } from "lucide-react";
import React, { useState } from "react";

const FileUpload = ({ setImages, dbImages }) => {
  const [imagePreview, setImagePreview] = useState([]);

  const [idFiles, setIdFiles] = useState([]);

  const handleFileUpload = (e) => {
    e.preventDefault();
    const files = e.target.files;

    const uniqueIdFiles = Array.from(files).map((file, index) => ({
      id: index + 1, // Unique ID for each file
      file: file,
    }));
    setIdFiles(uniqueIdFiles);
    setImages(uniqueIdFiles);

    const preview = uniqueIdFiles.map((item) => ({
      id: item.id, // Include ID in the preview object
      url: URL.createObjectURL(item.file),
    }));

    setImagePreview(preview);
  };

  const handleImageDelete = (id) => {
    const updatedItems = imagePreview.filter(image => image.id !== id);
    const remainingFiles = idFiles.filter((file) => file.id !== id);
    
    setIdFiles(remainingFiles);
    setImages(remainingFiles);

    setImagePreview(updatedItems);

  };

  const handleImageDBDelete = (index) => {
    console.log(index)
  }

  return (
    <div>
      <div className="flex items-center justify-center w-full">
        <label
          for="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              SVG, PNG, JPG or GIF (MAX. 800x400px)
            </p>
          </div>
          <input
            onChange={handleFileUpload}
            multiple
            id="dropzone-file"
            type="file"
            className="hidden"
            accept="image/png, image/gif, image/jpeg, image/jpg"
          />
        </label>
      </div>
      <div className="flex flexr-row gap-4 mt-5 flex-wrap">
        {
          imagePreview.length > 0 ? (
            imagePreview.map((image) => (
              <div className="relative" key={image.id}>
                <img
                  src={image.url}
                  alt="preview"
                  className="w-32 h-32 object-cover rounded-lg shadow-sm border-radius"
                />
    
                <div className="z-20 absolute top-0 right-0 bg-white shadow-md items-center">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleImageDelete(image.id);
                    }}
                    className="text-center"
                  >
                    <X className="text-red-800 p-1" />
                  
                  </button>
                </div>
              </div>
            ))
          ): (
            <></>
          )
        }
        {
          dbImages.length > 0 ? (
            dbImages.map((image) => (
              <div className="relative" key={image.id}>
                <img
                  src={image.url}
                  alt="preview"
                  className="w-32 h-32 object-cover rounded-lg shadow-sm border-radius"
                />
    
                <div className="z-20 absolute top-0 right-0 bg-white shadow-md items-center">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleImageDBDelete(image.id);
                    }}
                    className="text-center"
                  >
                    <X className="text-red-800 p-1" />
                  
                  </button>
                </div>
              </div>
            ))
          ): (
            <></>
          )
        }

      </div>
    </div>
  );
};

export default FileUpload;
