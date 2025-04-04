"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect } from "react";

const schema = yup.object().shape({
  type: yup.string().required("Property type is required"),
  title: yup
    .string()
    .required("Title is required")
    .min(5, "Title must be at least 5 characters"),
  description: yup
    .string()
    .required("Description is required")
    .min(20, "Description must be at least 20 characters"),
  bedrooms: yup.number().when("type", {
    is: "house",
    then: () =>
      yup
        .number()
        .required("Number of bedrooms is required")
        .min(0, "Cannot be negative"),
    otherwise: () => yup.number().notRequired(),
  }),
  bathrooms: yup.number().when("type", {
    is: "house",
    then: () =>
      yup
        .number()
        .required("Number of bathrooms is required")
        .min(0, "Cannot be negative"),
    otherwise: () => yup.number().notRequired(),
  }),
  size: yup.string().required("Property size is required"),
});

export default function PropertyDetailsForm({
  formData,
  updateFormData,
  nextStep,
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: formData,
  });

  const propertyType = watch("type");

  const onSubmit = (data) => {
    updateFormData(data);
    nextStep();
  };

  return (
    <div>
      {" "}
      {/* Fixed height container */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-xl font-semibold mb-8">Property Details</h2>

        <div className="mb-8">
          <label className="block text-gray-700 mb-3 font-medium">
            Property Type
          </label>
          <div className="flex space-x-6">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                {...register("type")}
                value="house"
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-lg">House</span>
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                {...register("type")}
                value="land"
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-lg">Land</span>
            </label>
          </div>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        <div className="mb-8">
          <label
            htmlFor="title"
            className="block text-gray-700 mb-2 font-medium"
          >
            Property Title
          </label>
          <input
            id="title"
            {...register("title")}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Modern 3-Bedroom House in East Legon"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div className="mb-8">
          <label
            htmlFor="description"
            className="block text-gray-700 mb-2 font-medium"
          >
            Description
          </label>
          <textarea
            id="description"
            {...register("description")}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the property, its location, special features, etc."
          ></textarea>
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="mb-8">
          <label
            htmlFor="size"
            className="block text-gray-700 mb-2 font-medium"
          >
            Property Size
          </label>
          <input
            id="size"
            {...register("size")}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 1500 sq ft, 2 acres, etc."
          />
          {errors.size && (
            <p className="text-red-500 text-sm mt-1">{errors.size.message}</p>
          )}
        </div>

        {/* House-specific fields section with fixed height */}
        <div className="h-32 mb-8">
          {" "}
          {/* Fixed height container for house fields */}
          {propertyType === "house" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="bedrooms"
                  className="block text-gray-700 mb-2 font-medium"
                >
                  Number of Bedrooms
                </label>
                <input
                  id="bedrooms"
                  type="number"
                  {...register("bedrooms")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
                {errors.bedrooms && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.bedrooms.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="bathrooms"
                  className="block text-gray-700 mb-2 font-medium"
                >
                  Number of Bathrooms
                </label>
                <input
                  id="bathrooms"
                  type="number"
                  {...register("bathrooms")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
                {errors.bathrooms && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.bathrooms.message}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <></>
            // <div className="flex items-center justify-center h-full text-gray-400 italic">
            //   <p>Additional fields will appear here based on property type</p>
            // </div>
          )}
        </div>

        <div
          className={`flex justify-end ${
            propertyType === "house" ? "mt-20 md:-mt-8" : "-mt-32"
          }`}
        >
          <button
            type="submit"
            className={`bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 transition duration-300
              `}
          >
            Next: Location
          </button>
        </div>
      </form>
    </div>
  );
}
