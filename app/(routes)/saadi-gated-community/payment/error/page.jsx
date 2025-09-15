import { CircleX } from "lucide-react";
import Link from "next/link";
import React from "react";

const ErrorPage = () => {
  return (
    <div className="w-full mt-5 px-12 pt-[7.5rem]">
      <div class="flex h-[60vh] items-center justify-center">
        <div>
          <div class="flex flex-col items-center space-y-2">
            <CircleX className="w-10 h-10 text-red-700" />
            <h1 class="text-4xl font-bold">Payment Unsuccessfull</h1>
            <p>Your Payment was unsuccessful. Try again Later</p>
            <a class="inline-flex items-center rounded border border-indigo-600 bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="mr-2 h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M7 16l-4-4m0 0l4-4m-4 4h18"
                />
              </svg>
              <Link href="/saadi-gated-community" class="text-sm font-medium text-white">
                {" "}
                View Plots{" "}
              </Link>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
