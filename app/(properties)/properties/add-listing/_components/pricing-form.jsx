"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useState } from "react";

export default function PricingForm({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) {
  const schema = yup.object().shape({
    listing_type: yup.string().required(),
  
    price: yup
      .number()
      .transform((value, originalValue) =>
        originalValue === "" || originalValue === null ? undefined : value
      )
      .when("listing_type", {
        is: "sale",
        then: (schema) =>
          schema
            .required("Price is required")
            .positive("Price must be positive")
            .typeError("Please enter a valid number"),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
  
    rental_price: yup
      .number()
      .transform((value, originalValue) =>
        originalValue === "" || originalValue === null ? undefined : value
      )
      .when("listing_type", {
        is: (val) => val === "rent" || val === "airbnb",
        then: (schema) =>
          schema
            .required("Rental price is required")
            .positive("Rental price must be positive")
            .typeError("Please enter a valid number"),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
  
    rental_duration: yup.string().when("listing_type", {
      is: "rent",
      then: (schema) => schema.required("Rental duration is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  
    airbnb_min_stay: yup
      .number()
      .transform((value, originalValue) =>
        originalValue === "" || originalValue === null ? undefined : value
      )
      .when("listing_type", {
        is: "airbnb",
        then: (schema) =>
          schema
            .required("Minimum stay is required")
            .min(1, "Minimum stay must be at least 1 day")
            .typeError("Please enter a valid number"),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
  
    negotiable: yup.boolean(),
  });
  

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      price: formData.price ?? null,
      rental_price: formData.rental_price ?? null,
      airbnb_min_stay: formData.airbnb_min_stay ?? null,
      rental_duration: formData.rental_duration || '',
      negotiable: formData.negotiable || false,
      listing_type: formData.listing_type || 'sale',
    }
    
  });

  useEffect(() => {
    console.log("Validation errors:", errors);
  }, [errors]);

  const listingType = watch("listing_type");
  const rentalPrice = watch("rental_price");
  const rentalDuration = watch("rental_duration");

  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (listingType === "rent" && rentalPrice && rentalDuration) {
      const monthlyPrice = parseFloat(rentalPrice);
      let months = 0;

      switch (rentalDuration) {
        case "3_months":
          months = 3;
          break;
        case "6_months":
          months = 6;
          break;
        case "1_year":
          months = 12;
          break;
        case "2_years":
          months = 24;
          break;
        case "3_years":
          months = 36;
          break;
        case "5_years":
          months = 60;
          break;
        default:
          months = 0;
      }

      setTotalAmount(monthlyPrice * months);
    } else {
      setTotalAmount(0);
    }
  }, [rentalPrice, rentalDuration, listingType]);

  const onSubmit = (data) => {
    const cleanedData = { ...data };

    if (listingType === "sale") {
      cleanedData.rental_price = null;
      cleanedData.rental_duration = null;
      cleanedData.airbnb_min_stay = null;
    } else if (listingType === "rent") {
      cleanedData.price = null;
      cleanedData.airbnb_min_stay = null;
    } else if (listingType === "airbnb") {
      cleanedData.price = null;
      cleanedData.rental_duration = null;
    }

    cleanedData.price = cleanedData.price
      ? parseFloat(cleanedData.price)
      : null;
    cleanedData.rental_price = cleanedData.rental_price
      ? parseFloat(cleanedData.rental_price)
      : null;
    cleanedData.airbnb_min_stay = cleanedData.airbnb_min_stay
      ? parseInt(cleanedData.airbnb_min_stay)
      : null;

    updateFormData(cleanedData);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-xl font-semibold mb-6">Pricing Information</h2>

      {listingType === "sale" && (
        <div className="mb-6">
          <label htmlFor="price" className="block text-gray-700 mb-2">
            Price (GHS)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
              ₵
            </span>
            <input
              id="price"
              {...register("price", { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="0.00"
            />
          </div>
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>
      )}

      {listingType === "rent" && (
        <>
          <div className="mb-6">
            <label htmlFor="rental_price" className="block text-gray-700 mb-2">
              Monthly Rent (GHS)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                ₵
              </span>
              <input
                id="rental_price"
                {...register("rental_price", { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="0.00"
              />
            </div>
            {errors.rental_price && (
              <p className="text-red-500 text-sm mt-1">
                {errors.rental_price.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Rental Duration</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("rental_duration")}
                  value="3_months"
                  className="form-radio h-5 w-5 text-primary"
                />
                <span className="ml-2">3 Months</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("rental_duration")}
                  value="6_months"
                  className="form-radio h-5 w-5 text-primary"
                />
                <span className="ml-2">6 Months</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("rental_duration")}
                  value="1_year"
                  className="form-radio h-5 w-5 text-primary"
                />
                <span className="ml-2">1 Year</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("rental_duration")}
                  value="2_years"
                  className="form-radio h-5 w-5 text-primary"
                />
                <span className="ml-2">2 Years</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("rental_duration")}
                  value="3_years"
                  className="form-radio h-5 w-5 text-primary"
                />
                <span className="ml-2">3 Years</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("rental_duration")}
                  value="5_years"
                  className="form-radio h-5 w-5 text-primary"
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

          {totalAmount > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-700">
                Total Amount for{" "}
                {rentalDuration === "3_months"
                  ? "3 Months"
                  : rentalDuration === "6_months"
                  ? "6 Months"
                  : rentalDuration === "1_year"
                  ? "1 Year"
                  : rentalDuration === "2_years"
                  ? "2 Years"
                  : rentalDuration === "3_years"
                  ? "3 Years"
                  : "5 Years"}
                :
                <span className="font-semibold ml-2">
                  ₵{totalAmount.toLocaleString()}
                </span>
              </p>
            </div>
          )}
        </>
      )}

      {listingType === "airbnb" && (
        <div className="mb-6">
          <label htmlFor="rental_price" className="block text-gray-700 mb-2">
            Price per Day (GHS)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
              ₵
            </span>
            <input
              id="rental_price"
              {...register("rental_price", { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="0.00"
            />
          </div>
          {errors.rental_price && (
            <p className="text-red-500 text-sm mt-1">
              {errors.rental_price.message}
            </p>
          )}
        </div>
      )}

      {listingType === "airbnb" && (
        <div className="mb-6">
          <label htmlFor="airbnb_min_stay" className="block text-gray-700 mb-2">
            Minimum Stay (Days)
          </label>
          <input
            id="airbnb_min_stay"
            {...register("airbnb_min_stay", { valueAsNumber: true })}
            type="number"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
          {errors.airbnb_min_stay && (
            <p className="text-red-500 text-sm mt-1">
              {errors.airbnb_min_stay.message}
            </p>
          )}
        </div>
      )}

      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register("negotiable")}
            className="form-checkbox h-5 w-5 text-primary"
          />
          <span className="ml-2 text-gray-700">Price is negotiable</span>
        </label>
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
          Next: Features
        </button>
      </div>
    </form>
  );
}
