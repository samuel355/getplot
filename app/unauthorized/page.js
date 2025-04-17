"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You are not authorized to access these resources. Please contact the administrator if you believe this is an error.
        </p>
        <Button
          onClick={() => router.push("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
} 