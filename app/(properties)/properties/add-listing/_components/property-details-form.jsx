"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect } from "react";

const schema = yup.object().shape({
  type: yup.string().required("Property type is required"),
  property_type: yup.string().when("type", {
    is: "house",
    then: () => yup.string().required("Please select a property type"),
    otherwise: () => yup.string().nullable().notRequired(),
  }),
  listing_type: yup.string().when("type", {
    is: "house",
    then: () => yup.string().required("Please select a listing type"),
    otherwise: () => yup.string().nullable().notRequired(),
  }),
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
        .min(1, "Number of bedrooms must be at least 1")
        .typeError("Please enter a valid number"),
    otherwise: () => yup.number().nullable().notRequired(),
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
  contact: yup
    .string()
    .required("Contact number is required")
    .matches(/^[0-9]+$/, "Please enter numbers only")
    .min(10, "Contact number must be at least 10 digits")
    .max(15, "Contact number cannot exceed 15 digits"),
  rental_type: yup.string().when("property_type", {
    is: "rent",
    then: () => yup.string().required("Rental type is required"),
    otherwise: () => yup.string().notRequired(),
  }),
  rental_duration: yup.string().when("property_type", {
    is: "rent",
    then: () => yup.string().required("Rental duration is required"),
    otherwise: () => yup.string().notRequired(),
  }),
  rental_price: yup.number().when("property_type", {
    is: "rent",
    then: () => yup.number().required("Rental price is required").min(0),
    otherwise: () => yup.number().notRequired(),
  }),
  rental_available_from: yup.date().when("property_type", {
    is: "rent",
    then: () => yup.date().required("Available from date is required"),
    otherwise: () => yup.date().notRequired(),
  }),
  rental_available_to: yup.date().when("property_type", {
    is: "rent",
    then: () => yup.date().required("Available to date is required"),
    otherwise: () => yup.date().notRequired(),
  }),
  rental_deposit: yup.number().when("property_type", {
    is: "rent",
    then: () => yup.number().required("Security deposit is required").min(0),
    otherwise: () => yup.number().notRequired(),
  }),
  rental_utilities_included: yup.boolean().when("property_type", {
    is: "rent",
    then: () => yup.boolean().required(),
    otherwise: () => yup.boolean().notRequired(),
  }),
  rental_furnished: yup.boolean().when("property_type", {
    is: "rent",
    then: () => yup.boolean().required(),
    otherwise: () => yup.boolean().notRequired(),
  }),
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
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...formData,
      type: formData.type || "house",
      property_type:
        formData.property_type || (formData.type === "land" ? "sale" : ""),
      listing_type:
        formData.listing_type || (formData.type === "land" ? "sale" : ""),
    },
  });

  const propertyType = watch("type");

  // Set default values when land is selected
  useEffect(() => {
    if (propertyType === "land") {
      setValue("property_type", "sale");
      setValue("listing_type", "sale");
      trigger("property_type");
      trigger("listing_type");
    }
  }, [propertyType, setValue, trigger]);

  const onSubmit = (data) => {
    // Ensure land properties are always set to sale
    if (data.type === "land") {
      data.property_type = "sale";
      data.listing_type = "sale";
    }

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

        {propertyType === "house" && (
          <>
            <div className="mb-8">
              <label className="block text-gray-700 mb-3 font-medium">
                Property Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    {...register("property_type")}
                    value="chamber_and_hall"
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2">Chamber & Hall</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    {...register("property_type")}
                    value="single_room"
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2">Single Room</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    {...register("property_type")}
                    value="single_room_porch"
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2">Single Room with Porch</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    {...register("property_type")}
                    value="self_contained"
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2">Self Contained</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    {...register("property_type")}
                    value="apartment"
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2">Apartment</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    {...register("property_type")}
                    value="duplex"
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2">Duplex</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    {...register("property_type")}
                    value="mansion"
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2">Mansion</span>
                </label>
              </div>
              {errors.property_type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.property_type.message}
                </p>
              )}
            </div>

            <div className="mb-8">
              <label className="block text-gray-700 mb-3 font-medium">
                Property For
              </label>
              <div className="flex space-x-6">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    {...register("listing_type")}
                    value="sale"
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-lg">For Sale</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    {...register("listing_type")}
                    value="rent"
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-lg">For Rent</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    {...register("listing_type")}
                    value="airbnb"
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-lg">Airbnb</span>
                </label>
              </div>
              {errors.listing_type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.listing_type.message}
                </p>
              )}
            </div>
          </>
        )}

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
            placeholder={
              propertyType === "house"
                ? "e.g., Modern 3-Bedroom House in East Legon"
                : "e.g., Prime Residential Plot in Airport Residential Area"
            }
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
            placeholder={
              propertyType === "house"
                ? "Describe the property, its location, special features, etc."
                : "Describe the land, its location, topography, accessibility, utilities, etc."
            }
          ></textarea>
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="mb-8">
          <label
            htmlFor="contact"
            className="block text-gray-700 mb-2 font-medium"
          >
            Contact Number
          </label>
          <input
            id="contact"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            {...register("contact")}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 0241234567"
          />
          {errors.contact && (
            <p className="text-red-500 text-sm mt-1">
              {errors.contact.message}
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
            placeholder={
              propertyType === "house"
                ? "e.g., 1500 sq ft"
                : "e.g., 2 acres, 100ft x 50ft"
            }
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

        {watch("property_type") === "rent" && (
          <div className="mb-8">
            <label className="block text-gray-700 mb-3 font-medium">
              Rental Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("rental_type")}
                  value="chamber_and_hall"
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-2">Chamber & Hall</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("rental_type")}
                  value="single_room"
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-2">Single Room</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("rental_type")}
                  value="single_room_porch"
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-2">Single Room with Porch</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("rental_type")}
                  value="self_contained"
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-2">Self Contained</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("rental_type")}
                  value="apartment"
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-2">Apartment</span>
              </label>
            </div>
            {errors.rental_type && (
              <p className="text-red-500 text-sm mt-1">
                {errors.rental_type.message}
              </p>
            )}
          </div>
        )}

        {watch("property_type") === "rent" && (
          <div className="mb-8">
            <label className="block text-gray-700 mb-3 font-medium">
              Rental Duration
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("rental_duration")}
                  value="short_term"
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-2">Short Term</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("rental_duration")}
                  value="1_year"
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-2">1 Year</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("rental_duration")}
                  value="2_years"
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-2">2 Years</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("rental_duration")}
                  value="5_years"
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-2">5 Years</span>
              </label>
            </div>
            {errors.rental_duration && (
              <p className="text-red-500 text-sm mt-1">
                {errors.rental_duration.message}
              </p>
            )}
          </div>
        )}

        {watch("property_type") === "rent" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Monthly Rent (₵)
              </label>
              <input
                type="number"
                {...register("rental_price")}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 1000"
              />
              {errors.rental_price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.rental_price.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Security Deposit (₵)
              </label>
              <input
                type="number"
                {...register("rental_deposit")}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 2000"
              />
              {errors.rental_deposit && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.rental_deposit.message}
                </p>
              )}
            </div>
          </div>
        )}

        {watch("property_type") === "rent" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Available From
              </label>
              <input
                type="date"
                {...register("rental_available_from")}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.rental_available_from && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.rental_available_from.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Available To
              </label>
              <input
                type="date"
                {...register("rental_available_to")}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.rental_available_to && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.rental_available_to.message}
                </p>
              )}
            </div>
          </div>
        )}

        {watch("property_type") === "rent" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("rental_utilities_included")}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Utilities Included</span>
              </label>
            </div>
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("rental_furnished")}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Furnished</span>
              </label>
            </div>
          </div>
        )}

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
