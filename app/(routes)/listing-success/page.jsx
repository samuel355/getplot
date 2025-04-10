"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function ListingSuccessPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <CheckCircleIcon className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          Listing Submitted Successfully!
        </h2>
        <p className="mt-2 text-gray-600">
          Your property listing has been submitted for review. We'll notify you once it's approved.
        </p>
        <div className="mt-8 text-sm text-gray-500">
          <p>Reference ID: {id}</p>
        </div>
        <div className="mt-8 flex flex-col space-y-3">
          <Link 
            href={`/properties/property/${id}`} 
            className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300"
          >
            View Your Listing
          </Link>
          <Link 
            href="/properties" 
            className="border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition duration-300"
          >
            Go to Dashboard
          </Link>
          <Link 
            href="/" 
            className="text-primary hover:underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}