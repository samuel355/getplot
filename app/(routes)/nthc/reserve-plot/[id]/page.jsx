"use client";
import { Input } from "@/components/ui/input";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { toast } from "react-toastify";
import { PaystackButton } from "react-paystack";
import Header from "@/app/_components/Header";
import { useUser } from "@clerk/nextjs";
import OptGroup from "@/app/(dashboard)/dashboard/_components/OptGroup";
import { Button } from "@/components/ui/button";
import { reservePlot } from "@/app/_actions/reserve-plot";

const plotInfo = {
  firstname: "",
  lastname: "",
  email: "",
  residentialAddress: "",
  country: "",
  phone: "",
  plotDetails: "",
  agent: "",
  plotTotalAmount: 0,
  paidAmount: 0,
  remainingAmount: 0,
  remarks: "",
  plotStatus: "",
  status: "",
  initialDeposite: 0,
};

const ReservePlot = () => {
  const [loader1, setLoader1] = useState(false);
  const [loader2, setLoader2] = useState(false);
  const [loader3, setLoader3] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [step1, setStep1] = useState(true);
  const [step2, setStep2] = useState(false);
  const [step3, setStep3] = useState(false);
  const [plotData, setPlotData] = useState(plotInfo);
  const [allDetails, setAllDetails] = useState();
  const [calcAmount, setCalcAmount] = useState(0);
  const { user } = useUser();
  
  let plot_area = allDetails?.properties?.SHAPE_Area
  const plot_size = (plot_area *  3109111.525693).toFixed(2)
  
  if( allDetails !== null && allDetails?.properties){
    allDetails.properties.Area = plot_size;
  }

  const {
    firstname,
    lastname,
    email,
    country,
    phone,
    residentialAddress,
    agent,
    plotTotalAmount,
    paidAmount,
    remainingAmount,
    remarks,
    status,
    plotStatus,
    initialDeposit,
  } = plotData;

  const { id } = useParams();
  const router = useRouter();
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  // Errors Checks
  const [statusEr, setStatusEr] = useState(false);
  const [plotTotalAmountEr, setPlotTotalAmountEr] = useState(false);
  const [initialDepositEr, setInitialDepositEr] = useState(false);
  const [paidAmtEr, setPaidAmtEr] = useState(false);
  const [fnameEr, setFnameEr] = useState(false);
  const [lnameEr, setLnameEr] = useState(false);
  const [emailEr, setEmailEr] = useState(false);
  const [countryEr, setCountryEr] = useState(false);
  const [phoneEr, setPhoneEr] = useState(false);
  const [resAddressEr, setResAddressEr] = useState(false);

  useEffect(() => {
    if (id) {
      fechPlotData();
    } else {
      router.push("/nthc");
    }
  }, []);

  let initialDepo = 0.25 * plotTotalAmount;
  const databaseName = "nthc";

  const handleStep1 = (e) => {
    e.preventDefault();

    if (
      plotTotalAmount === null ||
      plotTotalAmount === undefined ||
      plotTotalAmount === 0 ||
      plotTotalAmount === ""
    ) {
      setPlotTotalAmountEr(true);
      toast.error("The plot amount is not set. Contact the admin: 0322008282");
      return;
    } else {
      setPlotTotalAmountEr(false);
    }
    if (
      initialDeposit === null ||
      initialDeposit === undefined ||
      initialDeposit === 0 ||
      initialDeposit === ""
    ) {
      setInitialDepositEr(true);
      toast.error("Check the initial deposit");
      return;
    } else {
      setInitialDepositEr(false);
    }
    if (initialDeposit < initialDepo) {
      toast.error(
        `Check the initial deposit. It must be at least GHS. ${initialDepo.toLocaleString()}`,
      );
      return;
    }
    if (initialDeposit > plotTotalAmount) {
      toast.error(
        `Check the initial deposit. It must not be greater than the plot amount`,
      );
      return;
    }

    setStep1(false);
    setStep2(true);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    setStep1(true);
    setStep2(false);
  };

  const handlePrevLast = () => {
    setStep2(true);
    setStep3(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

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
      toast.error("Enter Residential Address");
      return;
    } else {
      setResAddressEr(false); //
    }

    setStep3(true);
    setStep2(false);
  };

  //Fetch Plot Details From DB
  const fechPlotData = async () => {
    const { data, error } = await supabase
      .from("nthc")
      .select("*")
      .eq("id", id);

    if (data) {
      setAllDetails(data[0]);
      setPlotData({
        firstname: data[0].firstname,
        lastname: data[0].lastname,
        email: data[0].email,
        residentialAddress: data[0].residentialAddress,
        country: data[0].country,
        phone: data[0].phone,
        agent: data[0].agent,
        plotTotalAmount: data[0].plotTotalAmount,
        paidAmount: data[0].paidAmount,
        remainingAmount: data[0].remainingAmount,
        remarks: data[0].remarks,
        plotStatus: data[0].status,
        status: data[0].status,
      });
      setCalcAmount(data[0].plotTotalAmount);
    } else {
      toast("Something went wrong fetching plot data");
      router.push("/nthc");
    }
    if (error) {
      console.log(error);
      toast("Something went wrong fetching plot data");
      router.push("/nthc");
    }
  };

  const onInputChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setPlotData({ ...plotData, [name]: value });
  };

  let amtRemaining = 0;
  const handleCalculateAmount = () => {
    amtRemaining = plotTotalAmount - initialDeposit;
    setCalcAmount(amtRemaining);
  };

  const handleInput = (event) => {
    const charCode = event.which ? event.which : event.keyCode;
    // Prevent input if the key is not a number (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  };

  //PayStack Component Props
  const componentProps = {
    publicKey: publicKey,
    email: plotData.email,
    currency: "GHS",
    amount: initialDeposit * 100,
    metadata: {
      firstname: plotData.firstname,
      lastname: plotData.lastname,
      email: email,
      country: plotData.country,
      phone: plotData.phone,
      residentialAddress: plotData.residentialAddress,
      agent: plotData.agent,
    },
    className: "bg-primary text-white py-2 px-4 rounded-md shadow-md",

    text:
      initialDeposit !== null && initialDeposit !== undefined
        ? `Pay GHS. ${initialDeposit.toLocaleString()} `
        : "Pay GHS. 0.00",

    onSuccess: (response) => {
      if (response.status === "success") {
        setVerifyLoading(true);
        router.push("/nthc/payment/success");
        toast.success("Thank you! your payment was made");
        verifyTransaction(response.reference);
      }
    },
    onClose: () => alert("Closing will make the transaction unsuccessfull"),
  };

  const verifyTransaction = async (reference) => {
    const secretKey = process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY;

    try {
      const url = `https://api.paystack.co/transaction/verify/${reference}`;
      const authorization = `Bearer ${secretKey}`;

      fetch(url, {
        method: "GET",
        headers: {
          Authorization: authorization,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          if (
            data.status === true &&
            data.message === "Verification successful"
          ) {
            //Send details to email and update plot details and redirect to thank you page
            //console.log(JSON.stringify(data.data));
            const paymentData = JSON.stringify(data.data);
            const amount = data.data.amount / 100;
            // json.parse(data.data)

            //Update plot details with plotData on Supabase
            savePaymentDetails(paymentData, amount, data);
          } else {
            toast.error("Your Transaction verification was not successfull");
            router.push("/nthc/payment/error");
          }
        })
        .catch((error) => {
          console.error(
            "There was a problem with your fetch operation:",
            error,
          );
          toast.error("Your Transaction verification was not successfull");
        });
    } catch (error) {
      console.error("Error verifying transaction:", error);
      toast.error("Your Transaction verification was not successfull");
    }
  };

  const savePaymentDetails = async (paymentData, amount, data) => {
    const remainingAmount = plotTotalAmount - amount;
    const { data: dbData, error } = await supabase
      .from("nthc")
      .update({
        firstname: data.data.metadata.firstname,
        lastname: data.data.metadata.lastname,
        email: data.data.metadata.email,
        country: data.data.metadata.country,
        phone: data.data.metadata.phone,
        residentialAddress: data.data.metadata.residentialAddress,
        agent: data.data.metadata.agent,
        paidAmount: amount,
        remainingAmount: remainingAmount,
        remarks: data.data.metadata.remarks,
        paymentDetails: paymentData,
        paymentId: data.data.id,
        paymentReference: data.data.reference,
        status: "Reserved",
      })
      .eq("id", id)
      .select();

    if (dbData) {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: data.data.metadata.email,
          firstname: data.data.metadata.firstname,
          lastname: data.data.metadata.lastname,
          paidAmount: "GHS. " + amount.toLocaleString(),
          plotDetails:
            "Plot Number " +
            allDetails.properties.Plot_No +
            " " +
            allDetails.properties.Street_Nam,
          plotSize:
            parseFloat(allDetails?.properties?.Shape_Length?.toFixed(5)) +
            " Acres ",
        }),
      });
      setVerifyLoading(false);
      toast.success("Transaction verified successfully");
    }
    if (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Header />
      {allDetails && (
        <div className="w-full px-10 md:px-16 lg:px-48 xl:px-48 mb-10 pt-[7.5rem]">
          <h2 className="font-bold text-2xl text-center mb-5">Plot Details</h2>

          <div className="shadow-md border rounded-sm mt-8">
            <form onSubmit={handleFormSubmit}>
              {/* Step 1 */}

              {step1 && (
                <div className="px-6 pt-4">
                  <h4 className="my-8 font-semibold text-xl text-center underline">
                    Plot Details Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
                    <div className="">
                      <h2 className="text-gray-900 font-semibold">
                        Plot Details
                      </h2>
                      <Input
                        type="text"
                        disabled
                        name="plotDetails"
                        value={
                          "Plot Number " +
                          allDetails.properties.Plot_No +
                          " " +
                          allDetails.properties.Street_Nam
                        }
                      />
                      <small className="text-red-800"></small>
                    </div>
                    <div className="">
                      <h2 className="text-gray-900 font-semibold">Plot Size</h2>
                      <Input
                        type="text"
                        disabled
                        name="plotSize"
                        value={
                          plot_size
                        }
                      />
                      <small className="text-red-800"></small>
                    </div>

                    <div className="flex gap-2 flex-col">
                      <h2 className="text-gray-900 font-semibold">
                        Plot Amount (GHS)
                      </h2>
                      <Input
                        name="plotTotalAmount"
                        type="number"
                        onChange={onInputChange}
                        disabled
                        value={plotTotalAmount}
                        onKeyPress={handleInput}
                        style={{ border: plotTotalAmountEr && `1px solid red` }}
                      />
                      {plotTotalAmountEr && (
                        <small className="text-red-900">
                          Action needed by Admin
                        </small>
                      )}
                    </div>

                    <div className="flex gap-2 flex-col">
                      <h2 className="text-gray-900 font-semibold">
                        Initial Deposit (GHS {initialDepo.toLocaleString()})
                      </h2>
                      <Input
                        name="initialDeposit"
                        type="number"
                        onChange={onInputChange}
                        value={initialDeposit}
                        onKeyPress={handleInput}
                        onKeyUp={handleCalculateAmount}
                        style={{ border: initialDepositEr && `1px solid red` }}
                      />
                      {initialDepositEr && (
                        <small className="text-red-900">
                          Enter GHS. {initialDepo.toLocaleString()} which is at
                          least 25% Which is of the plot amount
                        </small>
                      )}
                    </div>
                  </div>
                  {user?.publicMetadata?.role === "sysadmin" && (
                    <div className="mt-6">
                      <h2 className="text-gray-900 font-semibold">Remarks</h2>
                      <Textarea
                        onChange={onInputChange}
                        name="remarks"
                        value={remarks}
                      />
                    </div>
                  )}

                  <div className="flex mt-5 gap-4 flex-row items-center border border-primary justify-center">
                    <h2 className="text-gray-900 font-semibold">
                      You still have:
                    </h2>
                    <p className="font-medium text-lg">
                      {`GHS. (${calcAmount.toLocaleString()}) To Pay`}
                    </p>
                  </div>

                  <div className="flex items-center justify-center md:justify-end lg:justify-end gap-6 mt-5 pb-6">
                    <button
                      onClick={handleStep1}
                      className="bg-primary text-white py-2 px-4 rounded-md shadow-md"
                    >
                      {loader1 ? <Loader className="animate-spin" /> : "Next"}
                    </button>
                  </div>
                </div>
              )}

              {/* Step2 */}

              {step2 && (
                <div className="px-6 pt-4">
                  <h4 className="my-8 font-semibold text-xl text-center underline">
                    Client Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
                    <div className="">
                      <h2 className="text-gray-900 font-semibold">
                        First Name
                      </h2>
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
                        <small className="text-red-900">
                          Enter Phone Number
                        </small>
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

                    <div className="flex gap-2 flex-col">
                      <h2 className="text-gray-900 font-semibold">Agent</h2>
                      <Input
                        placeholder="Agent"
                        name="agent"
                        type="text"
                        onChange={onInputChange}
                        value={agent}
                      />
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

              {/* Step 3 */}
              {step3 && (
                <div className="px-6 pt-4">
                  <h4 className="my-8 font-semibold text-xl text-center underline">
                    Plot Details Information And Payment
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
                    <div className="">
                      <h2 className="text-gray-900 font-semibold">
                        Plot Details
                      </h2>
                      <Input
                        type="text"
                        disabled
                        name="plotDetails"
                        value={
                          "Plot Number " +
                          allDetails.properties.Plot_No +
                          " " +
                          allDetails.properties.Street_Nam
                        }
                      />
                      <small className="text-red-800"></small>
                    </div>
                    <div className="">
                      <h2 className="text-gray-900 font-semibold">Plot Size</h2>
                      <Input
                        type="text"
                        disabled
                        name="plotSize"
                        value={
                          plot_size
                        }
                      />
                      <small className="text-red-800"></small>
                    </div>
                    <div className="flex gap-2 flex-col">
                      <h2 className="text-gray-900 font-semibold">
                        Plot Amount (GHS)
                      </h2>
                      <Input
                        name="plotTotalAmount"
                        type="number"
                        onChange={onInputChange}
                        disabled
                        value={plotTotalAmount}
                        onKeyPress={handleInput}
                        style={{ border: plotTotalAmountEr && `1px solid red` }}
                      />
                      {plotTotalAmountEr && (
                        <small className="text-red-900">
                          Action needed by Admin
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-end lg:justify-end gap-6 mt-5 pb-6">
                    <button
                      disabled={loader3}
                      onClick={handlePrevLast}
                      className="bg-white text-primary py-2 px-4 rounded-md shadow-md border"
                    >
                      {loader1 ? (
                        <Loader className="animate-spin" />
                      ) : (
                        "Previous"
                      )}
                    </button>

                    {loader3 ? (
                      <Loader className="animate-spin" />
                    ) : (
                      // <PaystackButton {...componentProps} />
                      <Button
                        onClick={() =>
                          reservePlot(
                            allDetails,
                            plotTotalAmount,
                            initialDeposit,
                            setLoader3,
                            router,
                            databaseName,
                            id,
                            email,
                            firstname,
                            lastname,
                            phone,
                            country,
                            residentialAddress,
                          )
                        }
                      >
                        Reserve Plot
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ReservePlot;
