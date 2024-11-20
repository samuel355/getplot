"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";

const SuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const router = useRouter();

  useEffect(() => {
    if (redirect === "" || redirect === null || redirect === undefined) {
      router.push("/");
    }else{
      setLoading(false)
    }
  }, [redirect]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full mt-5 pt-[7.5rem]">
      <div className="flex h-[60vh] items-center justify-center pb-10">
        <div className=" mx-6">
          <div className="flex flex-col items-center gap-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-28 w-28 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="text-4xl font-bold">
              Payment and Plot Details sent Successfull
            </h1>
            <p>
              Thank you for your interest! Check your email for all the details
              and instructions.
            </p>
            <a className="flex items-center rounded bg-primary px-4 py-2 text-white">
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
              <Link href={`${redirect}`} className="text-sm font-medium text-white">
                You can buy or reserve other plots{" "}
              </Link>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
