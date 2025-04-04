"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  price: yup
    .number()
    .required("Price is required")
    .positive("Price must be positive")
    .typeError("Price must be a number"),
  negotiable: yup.boolean(),
});

export default function PricingForm({ formData, updateFormData, nextStep, prevStep }) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      price: formData.price || '',
      negotiable: formData.negotiable || false,
    }
  });
  
  const onSubmit = (data) => {
    updateFormData(data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-xl font-semibold mb-6">Pricing Information</h2>
      
      <div className="mb-6">
        <label htmlFor="price" className="block text-gray-700 mb-2">
          Price (GHS)
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">₵</span>
          <input
            id="price"
            {...register("price")}
            type="number"
            step="0.01"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="0.00"
          />
        </div>
        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
      </div>
      
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