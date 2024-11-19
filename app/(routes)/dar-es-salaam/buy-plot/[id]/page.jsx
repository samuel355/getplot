"use client";
import { Input } from "@/components/ui/input";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

import { Textarea } from "@/components/ui/textarea";
import { ContactRound, Loader, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { toast } from "react-toastify";
import { PaystackButton } from "react-paystack";
import Header from "@/app/_components/Header";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import OptGroup from "@/app/(dashboard)/dashboard/_components/OptGroup";
import { NextResponse } from "next/server";

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
};

const EditPlot = () => {
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
  } = plotData;

  const { id } = useParams();
  const router = useRouter();
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  // Errors Checks
  const [statusEr, setStatusEr] = useState(false);
  const [plotTotalAmountEr, setPlotTotalAmountEr] = useState(false);
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
      router.push("/dar-es-salaam");
    }
  }, []);

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
      toast.error("Enter residential address");
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
      .from("dar_es_salaam")
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
    } else {
      toast("Something went wrong fetching plot data");
      router.replace("/dar-es-salaam");
    }
    if (error) {
      console.log(error);
      toast("Something went wrong fetching plot data");
      router.push("/dar-es-salaam");
    }
  };

  const onInputChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setPlotData({ ...plotData, [name]: value });
  };

  let amtRemaining = 0;
  const handleCalculateAmount = () => {
    amtRemaining = plotTotalAmount - paidAmount;
    setCalcAmount(amtRemaining);
    setPlotData({ ...plotData, remainingAmount: amtRemaining });
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
    amount: plotTotalAmount * 100,
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
      plotTotalAmount !== null && plotTotalAmount !== undefined
        ? `Pay GHS. ${plotTotalAmount.toLocaleString()} `
        : "Pay GHS. 0.00",

    onSuccess: (response) => {
      if (response.status === "success") {
        setVerifyLoading(true);
        toast.success("Thank you! your payment was made");
        router.push("/dar-es-salaam/payment/success");
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
            const paymentData = JSON.stringify(data.data);
            const amount = data.data.amount / 100;
            // json.parse(data.data)

            //Update plot details with plotData on Supabase
            savePaymentDetails(paymentData, amount, data);
          } else {
            toast.error("Your Transaction verification was not successfull");
            router.push("/dar-es-salaam/payment/error");
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
    const { data: dbData, error } = await supabase
      .from("dar_es_salaam")
      .update({
        firstname: data.data.metadata.firstname,
        lastname: data.data.metadata.lastname,
        email: data.data.metadata.email,
        country: data.data.metadata.country,
        phone: data.data.metadata.phone,
        residentialAddress: data.data.metadata.residentialAddress,
        agent: data.data.metadata.agent,
        paidAmount: amount,
        remainingAmount: 0,
        remarks: data.data.metadata.remarks,
        paymentDetails: paymentData,
        paymentId: data.data.id,
        paymentReference: data.data.reference,
        status: "Sold",
      })
      .eq("id", id)
      .select();

    //Send Email to the customer
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

  
  const handleBuyPlot = async () => {
    setLoader3(true)
    const cedisAccount = [
      {
        title: "CEDIS ACCOUNT",
        Bank_Name: "STANBIC BANK",
        Account_Name: "LAND AND HOMES CONSULT",
        Account_Number: "9040009771047",
        Branch_Name: "KNUST, KUMASI-GHANA",
      },
    ];
    const dollarAccount = [
      {
        title: "DOLLAR ACCOUNT",
        Bank_Name: "STANBIC BANK",
        Account_Name: "LAND AND HOMES CONSULT",
        Account_Number: "9040011449268",
        Branch_Name: "KNUST, KUMASI-GHANA",
      },
    ];

    const doc = new jsPDF();
    const plotColumns = [
      { header: "Plot No", dataKey: "Plot_No" },
      { header: "Street Name", dataKey: "Street_Nam" },
      { header: "Size (Acres)", dataKey: "Area" },
      { header: "Plot Area", dataKey: "plotArea" },
      { header: "Plot Amount (GHS)", dataKey: "plotAmount" },
    ];

    allDetails.properties.plotAmount = plotTotalAmount;
    allDetails.properties.plotArea = 'Ejisu Kumasi'
    const plotRows = [allDetails.properties];``

    const topMargin = 25;
    doc.autoTable({
      columns: plotColumns,
      body: plotRows,
      startY: topMargin,
    });

    // Add Plot Details Heading (with underline)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const plotHeadingY = doc.autoTable.previous.finalY - 25;
    const plotHeadingX = 10;
    doc.text("Plot Details", plotHeadingX, plotHeadingY);
    doc.setLineWidth(0.5);
    doc.line(
      plotHeadingX,
      plotHeadingY + 2,
      plotHeadingX + doc.getTextWidth("Plot Details"),
      plotHeadingY + 2,
    );

    // --- Account Details Tables ---
    const accountColumns = [
      { header: "Title", dataKey: "title" },
      { header: "Bank Name", dataKey: "Bank_Name" },
      { header: "Account Name", dataKey: "Account_Name" },
      { header: "Account Number", dataKey: "Account_Number" },
      { header: "Branch Name", dataKey: "Branch_Name" },
    ];

    // Add Cedis Account Table
    const cedisStartY = doc.autoTable.previous.finalY + 15; // Increased spacing
    doc.autoTable({
      columns: accountColumns,
      body: cedisAccount,
      startY: cedisStartY,
    });

    // Add Cedis Account Heading (with underline)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const cedisHeadingY = cedisStartY - 5;
    const cedisHeadingX = 10;
    doc.text("Cedis Account Details", cedisHeadingX, cedisHeadingY);
    doc.setLineWidth(0.5);
    doc.line(
      cedisHeadingX,
      cedisHeadingY + 2,
      cedisHeadingX + doc.getTextWidth("Cedis Account Details"),
      cedisHeadingY + 2,
    );

    // Add Dollar Account Table
    const dollarStartY = doc.autoTable.previous.finalY + 15; // Increased spacing
    doc.autoTable({
      columns: accountColumns,
      body: dollarAccount,
      startY: dollarStartY,
    });

    // Add Dollar Account Heading (with underline)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const dollarHeadingY = dollarStartY - 5;
    const dollarHeadingX = 10;
    doc.text("Dollar Account Details", dollarHeadingX, dollarHeadingY);
    doc.setLineWidth(0.5);
    doc.line(
      dollarHeadingX,
      dollarHeadingY + 2,
      dollarHeadingX + doc.getTextWidth("Dollar Account Details"),
      dollarHeadingY + 2,
    );

    const finalText =
      "To secure plot ownership, kindly make payment to the account above, either the dollar account or the cedis account and present your receipt in our office at Kumasi Dichemso. Or Call 0322008282/+233 24 883 8005";
    const finalTextY = doc.autoTable.previous.finalY + 15;
    doc.setFontSize(10);
    // Use doc.textWithMeasurement to handle text wrapping
    const maxWidth = doc.internal.pageSize.getWidth() - 20; // Allow 10px margin on each side
    const textLines = doc.splitTextToSize(finalText, maxWidth);
    let currentY = finalTextY;
    textLines.forEach((line) => {
      doc.text(line, 10, currentY);
      currentY += 5; // Adjust vertical spacing between lines
    });

    //doc.save("plot_details.pdf");

    const pdfBlob = doc.output("blob"); // Get PDF as a Blob

    const formData = new FormData();
    formData.append("pdf", pdfBlob, "plot_details.pdf"); // Append PDF

    //Other data
    formData.append("to", email);
    formData.append("firstname", firstname);
    formData.append("lastname", lastname);
    formData.append("plotArea", "Ejisu - Kumasi");
    formData.append("amount", "GHS. " + plotTotalAmount.toLocaleString());
    formData.append(
      "plotDetails",
      "Plot Number " +
        allDetails.properties.Plot_No +
        " " +
        allDetails.properties.Street_Nam,
    );
    formData.append(
      "plotSize",
      parseFloat(allDetails?.properties?.Area?.toFixed(5)) + " Acres ",
    );

    const res = await fetch("/api/buy-plot", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      setLoader3(false)
      // Handle the error appropriately
      console.error("Error sending email:", await res.text());
      toast.error('Sorry something went wrong. Try again later')
    }
    setLoader3(false)
    router.replace('/dar-es-salaam/message')
  };

  return (
    <>
      <Header />

      {allDetails && (
        <div className="w-full px-10 md:px-16 lg:px-48 xl:px-48 pt-[7.5rem]">
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
                          parseFloat(allDetails?.properties?.Area?.toFixed(5)) +
                          " Acres "
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
                        onKeyUp={handleCalculateAmount}
                        style={{ border: plotTotalAmountEr && `1px solid red` }}
                      />
                      {plotTotalAmountEr && (
                        <small className="text-red-900">
                          Action needed by Admin
                        </small>
                      )}
                    </div>
                  </div>
                  {user?.publicMetadata?.role === "role" && (
                    <div className="mt-6">
                      <h2 className="text-gray-900 font-semibold">Remarks</h2>
                      <Textarea
                        onChange={onInputChange}
                        name="remarks"
                        value={remarks}
                      />
                    </div>
                  )}

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
                          parseFloat(allDetails?.properties?.Area?.toFixed(5)) +
                          " Acres "
                        }
                      />
                      <small className="text-red-800"></small>
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
                      <Button onClick={handleBuyPlot}>Buy Plot</Button>
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

export default EditPlot;
