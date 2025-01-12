'use client'
import Header from "@/app/_components/Header";
import React, { useState } from "react";
import { DataTable } from "./datatable";
import { columns } from "./columns";
import { useCart } from "@/store/useStore";

const data = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "298okjs",
    amount: 200,
    status: "pending",
    email: "sam@example.com",
  },
  // ...
]

const BuyPlot = () => {
  const [step1, setStep1] = useState(true);
  const {plots, getTotal} = useCart()
  const total = getTotal();
  return (
    <>
      <Header />
      <div className="w-full px-10 md:px-16 lg:px-48 xl:px-48 pt-[7.5rem]">
        <h2 className="font-bold text-2xl text-center mb-5">Plot Details</h2>

        <div className="shadow-md border rounded-sm mt-8">
          <form>
            {/* STEP 1 */}
            {step1 && (
              <div className="px-6 py-4 ">
                <h4 className="my-8 font-semibold text-xl text-center underline">
                  Plot Details Information
                </h4>
                <DataTable columns={columns} data={plots} />
                <div className="flex items-center gap-8 mt-2">
                  <p className="font-bold text-xl">Total:</p>
                  <p className="font-bold text-xl">GHS. {total.toLocaleString()}</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default BuyPlot;
