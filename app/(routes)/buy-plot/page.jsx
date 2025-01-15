"use client";
import Header from "@/app/_components/Header";
import React, { useEffect, useState } from "react";
import { DataTable } from "./datatable";
import { columns } from "./columns";
import { useCart } from "@/store/useStore";
import { Loader } from "lucide-react";
import OptGroup from "@/app/(dashboard)/dashboard/_components/OptGroup";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { BuyPlotCheckout } from "@/app/_actions/buy-plots-checkout";
import { useRouter } from "next/navigation";

const plotInfo = {
  firstname: "",
  lastname: "",
  email: "",
  residentialAddress: "",
  country: "",
  phone: "",
};

const BuyPlot = () => {
  const [step1, setStep1] = useState(true);
  const [step2, setStep2] = useState(false);
  const [loader1, setLoader1] = useState(false);
  const [loader2, setLoader2] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [plotData, setPlotData] = useState(plotInfo);
  const { plots, getTotal,clearCart } = useCart();
  const total = getTotal();
  const router = useRouter();

  useEffect(() => {
    if(plots.length <= 0){
      router.replace('/checkout')
    }
  }, [plots])

  const { firstname, lastname, email, country, phone, residentialAddress } =
    plotData;

  // Errors Checks
  const [fnameEr, setFnameEr] = useState(false);
  const [lnameEr, setLnameEr] = useState(false);
  const [emailEr, setEmailEr] = useState(false);
  const [countryEr, setCountryEr] = useState(false);
  const [phoneEr, setPhoneEr] = useState(false);
  const [resAddressEr, setResAddressEr] = useState(false);

  const handleStep1 = () => {
    setStep2(true);
    setStep1(false);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    setStep1(true);
    setStep2(false);
  };

  const onInputChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setPlotData({ ...plotData, [name]: value });
  };

  const handleInput = (event) => {
    const charCode = event.which ? event.which : event.keyCode;
    // Prevent input if the key is not a number (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    if (firstname === null || firstname === undefined || firstname === "") {
      setFnameEr(true);
      toast.error("Enter first name");
      return;
    } else {
      setFnameEr(false); //
    }

    if (lastname === null || lastname === undefined || lastname === "") {
      setLnameEr(true);
      toast.error("Enter last name");
      return;
    } else {
      setLnameEr(false); //
    }

    if (email === null || email === undefined || email === "") {
      setEmailEr(true);
      toast.error("Enter Email");
      return;
    } else {
      setEmailEr(false); //
    }
    if (
      country === null ||
      country === undefined ||
      country === "" ||
      country === "Select Country"
    ) {
      setCountryEr(true);
      toast.error("Choose Country");
      return;
    } else {
      setCountryEr(false); //
    }

    if (phone === null || phone === undefined || phone === "") {
      setPhoneEr(true);
      toast.error("Enter phone number");
      return;
    } else if (phone.length !== 10) {
      setPhoneEr(false);
      toast.error("Phone number must be 10");
      return;
    } else {
      setPhoneEr(false); //
    }
    if (
      residentialAddress === null ||
      residentialAddress === undefined ||
      residentialAddress === ""
    ) {
      setResAddressEr(true);
      toast.error("Enter residential address");
      return;
    } else {
      setResAddressEr(false); //
    }
    if (plots.length > 0) {
      setVerifyLoading(true);
      BuyPlotCheckout(plots, plotData, total, setVerifyLoading, router);
    } else {
      toast.error("You have not selected any plot to buy");
      router.replace("/");
    }
    
  };

  return (
    <>
      <Header />
      <div className="w-full px-10 md:px-16 lg:px-48 xl:px-48 pt-[7.5rem]">
        <h2 className="font-bold text-2xl text-center mb-5">Plot Details</h2>

        <div className="shadow-md border rounded-sm mt-8">
          <form onSubmit={handleFormSubmit}>
            {/* STEP 1 */}
            {step1 && (
              <div className="px-6 py-4 ">
                <h4 className="my-8 font-semibold text-xl text-center underline">
                  Plot{plots.length > 1 ? "s" : ""} Details
                </h4>
                <DataTable columns={columns} data={plots} />
                <div className="flex items-center gap-8 mt-4">
                  <p className="font-bold text-xl">TOTAL:</p>
                  <p className="font-bold text-xl">
                    GHS. {total.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center justify-center md:justify-end lg:justify-end gap-6 mt-1 pb-6">
                  <button
                    onClick={handleStep1}
                    className="bg-primary text-white py-2 px-4 rounded-md shadow-md"
                  >
                    {loader1 ? <Loader className="animate-spin" /> : "Next"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step2 && (
              <div className="px-6 pt-4">
                <h4 className="my-8 font-semibold text-xl text-center underline">
                  Client Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
                  <div className="">
                    <h2 className="text-gray-900 font-semibold">First Name</h2>
                    <Input
                      type="text"
                      placeholder="First Name"
                      name="firstname"
                      onChange={onInputChange}
                      value={firstname}
                      style={{ border: fnameEr && `1px solid red` }}
                    />
                    {fnameEr && (
                      <small className="text-red-900">
                        Enter your firstname
                      </small>
                    )}
                  </div>
                  <div className="">
                    <h2 className="text-gray-900 font-semibold">
                      Last Name(s)
                    </h2>
                    <Input
                      type="text"
                      name="lastname"
                      onChange={onInputChange}
                      value={lastname}
                      style={{ border: lnameEr && `1px solid red` }}
                    />
                    {lnameEr && (
                      <small className="text-red-900">
                        Enter your last name(s)
                      </small>
                    )}
                  </div>

                  <div className="flex gap-2 flex-col">
                    <h2 className="text-gray-900 font-semibold">
                      Email Address
                    </h2>
                    <Input
                      placeholder="Email Address"
                      name="email"
                      type="email"
                      onChange={onInputChange}
                      value={email}
                      style={{ border: emailEr && `1px solid red` }}
                    />
                    {emailEr && (
                      <small className="text-red-900">Enter your email</small>
                    )}
                  </div>

                  <div className="flex gap-2 flex-col">
                    <h2 className="text-gray-900 font-semibold">Country</h2>
                    <select
                      onChange={onInputChange}
                      className="w-full py-[9px] bg-white rounded-md text-dark border px-2"
                      name="country"
                      id="countryCode"
                      value={country}
                      style={{ border: countryEr && `1px solid red` }}
                    >
                      <option value="Select Country"> Select Country</option>
                      <option data-countrycode="GH" value="Ghana (+233)">
                        Ghana (+233)
                      </option>

                      <OptGroup />
                    </select>
                    {countryEr && (
                      <small className="text-red-900">
                        Selecet your country
                      </small>
                    )}
                  </div>

                  <div className="flex gap-2 flex-col">
                    <h2 className="text-gray-900 font-semibold">
                      Phone Number
                    </h2>
                    <Input
                      placeholder="Phone Number"
                      name="phone"
                      type="number"
                      onChange={onInputChange}
                      value={phone}
                      onKeyPress={handleInput}
                      style={{ border: phoneEr && `1px solid red` }}
                    />
                    {phoneEr && (
                      <small className="text-red-900">Enter Phone Number</small>
                    )}
                  </div>

                  <div className="flex gap-2 flex-col">
                    <h2 className="text-gray-900 font-semibold">
                      Residential Address
                    </h2>
                    <Input
                      placeholder="Residential Address"
                      name="residentialAddress"
                      type="text"
                      onChange={onInputChange}
                      value={residentialAddress}
                      style={{ border: resAddressEr && `1px solid red` }}
                    />
                    <small className="text-red-800"></small>
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-end lg:justify-end gap-6 mt-5 pb-6">
                  <button
                    onClick={handlePrev}
                    disabled={loader2}
                    className="bg-white border text-primary py-2 px-4 rounded-md shadow-md"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white py-2 px-4 rounded-md shadow-md"
                  >
                    {verifyLoading ? (
                      <Loader className="animate-spin" />
                    ) : (
                      "Proceed"
                    )}
                  </button>
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
