"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { toast } from "react-toastify";
import Header from "@/app/_components/Header";

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
  const [step1, setStep1] = useState(true);
  const [step2, setStep2] = useState(false);
  const [plotData, setPlotData] = useState(plotInfo);
  const [allDetails, setAllDetails] = useState();
  const [calcAmount, setCalcAmount] = useState(0);
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
    if (plotStatus === null && status === undefined) {
      setStatusEr(true);
      toast.error("Please select status");
      return;
    } else if (plotStatus === null && status === "Change Status") {
      setStatusEr(true);
      toast.error("Please select status");
      return;
    } else {
      setStatusEr(false);
    }

    if (status === "Sold" || status === "Reserved") {
      if (plotTotalAmount === null || plotTotalAmount === 0) {
        setPlotTotalAmountEr(true);
        toast.error("Please enter plot total amount");
        return;
      } else {
        setPlotTotalAmountEr(false);
      }

      if (paidAmount === null || paidAmount === 0) {
        setPaidAmtEr(true);
        toast.error("Please add amount paid");
        return;
      } else {
        setPaidAmtEr(false);
      }

      if (paidAmount - plotTotalAmount > 0) {
        toast.error(
          "Please check the amounts well. The paid amount must not be greater than the total amount of the plot."
        );
        return;
      }
    }

    setStep1(false);
    setStep2(true);
  };

  const handlePrev = () => {
    setStep1(true);
    setStep2(false);
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
      toast.error("Enter phone number");
      return;
    } else {
      setResAddressEr(false); //
    }

    //Update plot details with plotData on Supabase
    setLoader2(true);
    const { data, error } = await supabase
      .from("dar-es-salaam")
      .update({
        status: plotData.status,
        firstname: plotData.firstname,
        lastname: plotData.lastname,
        email: plotData.email,
        country: plotData.country,
        phone: plotData.phone,
        residentialAddress: plotData.residentialAddress,
        agent: plotData.agent,
        plotTotalAmount: plotData.plotTotalAmount,
        paidAmount: plotData.paidAmount,
        remainingAmount: plotData.remainingAmount,
        remarks: plotData.remarks,
      })
      .eq("id", id)
      .select();

    if (data) {
      toast.success("Plot details updated successfully");
      setLoader2(false);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
    if (error) {
      console.log(error);
      toast.error("Sorry errror happened updating the plot details");
      setLoader2(false);
    }
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

  return (
    <>
    <Header />
      {allDetails && (
        <div className="w-full px-10 md:px-16 lg:px-48 xl:px-48 pt-[7.5rem]">
          <h2 className="font-bold text-2xl text-center mb-5">
            Edit Plot Details
          </h2>

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
                      <h2 className="text-gray-900 font-semibold">
                        Plot Status
                      </h2>
                      <Input
                        type="text"
                        disabled
                        name="plotStatus"
                        value={plotStatus}
                      />
                      <small className="text-red-900"></small>
                    </div>
                    <div className="">
                      <h2 className="text-md font-semibold">
                        Change Plot Status
                      </h2>
                      <select
                        onChange={onInputChange}
                        className="w-full py-[9px] bg-white rounded-md text-dark border px-2"
                        name="status"
                        value={status}
                        style={{ border: statusEr && `1px solid red` }}
                      >
                        <option value="Change Status"> Change Status</option>
                        <option value="Sold">Sold</option>
                        <option value="Reserved">Reserve</option>
                        <option value="Available">Available</option>
                      </select>
                      {statusEr && (
                        <small className="text-red-900">
                          Choose Plot Status
                        </small>
                      )}
                    </div>

                    <div className="flex gap-2 flex-col">
                      <h2 className="text-gray-900 font-semibold">
                        Total Amount
                      </h2>
                      <Input
                        placeholder="Plot Total Amount"
                        name="plotTotalAmount"
                        type="number"
                        onChange={onInputChange}
                        value={plotTotalAmount}
                        onKeyPress={handleInput}
                        onKeyUp={handleCalculateAmount}
                        style={{ border: plotTotalAmountEr && `1px solid red` }}
                      />
                      {plotTotalAmountEr && (
                        <small className="text-red-900">
                          Enter Plot amount
                        </small>
                      )}
                    </div>

                    <div className="flex gap-2 flex-col">
                      <h2 className="text-gray-900 font-semibold">
                        Paid Amount
                      </h2>
                      <Input
                        placeholder="Paid Amount"
                        name="paidAmount"
                        type="number"
                        onChange={onInputChange}
                        value={paidAmount}
                        onKeyPress={handleInput}
                        onKeyUp={handleCalculateAmount}
                        style={{ border: paidAmtEr && `1px solid red` }}
                      />
                      {paidAmtEr && (
                        <small className="text-red-900">
                          Enter amount paid
                        </small>
                      )}
                    </div>

                    <div className="flex gap-2 flex-col">
                      <h2 className="text-gray-900 font-semibold">
                        Remaining Amount
                      </h2>
                      <Input
                        placeholder="Remaining Amount"
                        name="remainingAmount"
                        type="number"
                        onChange={onInputChange}
                        value={remainingAmount}
                        onKeyPress={handleInput}
                        onKeyUp={handleCalculateAmount}
                        disabled
                      />
                      <small className="text-red-800"></small>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h2 className="text-gray-900 font-semibold">Remarks</h2>
                    <Textarea
                      onChange={onInputChange}
                      name="remarks"
                      value={remarks}
                    />
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

                        <optgroup className="bg-white" label="Other countries">
                          <option data-countrycode="DZ" value="Algeria (+213)">
                            Algeria (+213)
                          </option>
                          <option data-countrycode="AD" value="Andorra (+376)">
                            Andorra (+376)
                          </option>
                          <option data-countrycode="AO" value="Angola (+244)">
                            Angola (+244)
                          </option>
                          <option
                            data-countrycode="AI"
                            value="Anguilla (+1264)"
                          >
                            Anguilla (+1264)
                          </option>
                          <option
                            data-countrycode="AG"
                            value="Antigua & Barbuda (+1268)"
                          >
                            Antigua &amp; Barbuda(+1268)
                          </option>
                          <option data-countrycode="AR" value="Argentina (+54)">
                            Argentina (+54)
                          </option>
                          <option data-countrycode="AM" value="Armenia (+374)">
                            Armenia (+374)
                          </option>
                          <option data-countrycode="AW" value="Aruba (+297">
                            Aruba (+297)
                          </option>
                          <option data-countrycode="AU" value="Australia (+61)">
                            Australia (+61)
                          </option>
                          <option data-countrycode="AT" value="Austria (+43)">
                            Austria (+43)
                          </option>
                          <option
                            data-countrycode="AZ"
                            value="Azerbaijan (+994)"
                          >
                            Azerbaijan (+994)
                          </option>
                          <option data-countrycode="BS" value="Bahamas (+1242)">
                            Bahamas (+1242)
                          </option>
                          <option data-countrycode="BH" value="Bahrain (+973)">
                            Bahrain (+973)
                          </option>
                          <option
                            data-countrycode="BD"
                            value="Bangladesh (+880)"
                          >
                            Bangladesh (+880)
                          </option>
                          <option
                            data-countrycode="BB"
                            value="Barbados (+1246)"
                          >
                            Barbados (+1246)
                          </option>
                          <option data-countrycode="BY" value="Belarus (+375)">
                            Belarus (+375)
                          </option>
                          <option data-countrycode="BE" value="Belgium (+32)">
                            Belgium (+32)
                          </option>
                          <option data-countrycode="BZ" value="Belize (+501)">
                            Belize (+501)
                          </option>
                          <option data-countrycode="BJ" value="Benin (+229)">
                            Benin (+229)
                          </option>
                          <option data-countrycode="BM" value="Bermuda (+1441)">
                            Bermuda (+1441)
                          </option>
                          <option data-countrycode="BT" value="Bhutan (+975)">
                            Bhutan (+975)
                          </option>
                          <option data-countrycode="BO" value="Bolivia (+591)">
                            Bolivia (+591)
                          </option>
                          <option
                            data-countrycode="BA"
                            value="Bosnia Herzegovina (+387)"
                          >
                            Bosnia Herzegovina (+387)
                          </option>
                          <option data-countrycode="BW" value="Botswana (+267)">
                            Botswana (+267)
                          </option>
                          <option data-countrycode="BR" value="Brazil (+55)">
                            Brazil (+55)
                          </option>
                          <option data-countrycode="BN" value="Brunei (+673)">
                            Brunei (+673)
                          </option>
                          <option data-countrycode="BG" value="Bulgaria (+359)">
                            Bulgaria (+359)
                          </option>
                          <option
                            data-countrycode="BF"
                            value="Burkina Faso (+226)"
                          >
                            Burkina Faso (+226)
                          </option>
                          <option data-countrycode="BI" value="Burundi (+257)">
                            Burundi (+257)
                          </option>
                          <option data-countrycode="KH" value="Cambodia (+855)">
                            Cambodia (+855)
                          </option>
                          <option data-countrycode="CM" value="Cameroon (+237)">
                            Cameroon (+237)
                          </option>
                          <option data-countrycode="CA" value="Canada (+1)">
                            Canada (+1)
                          </option>
                          <option
                            data-countrycode="CV"
                            value="Cape Verde Islands (+238)"
                          >
                            Cape Verde Islands (+238)
                          </option>
                          <option
                            data-countrycode="KY"
                            value="Cayman Islands (+1345)"
                          >
                            Cayman Islands (+1345)
                          </option>
                          <option
                            data-countrycode="CF"
                            value="Central African Republic (+236)"
                          >
                            Central African Republic (+236)
                          </option>
                          <option data-countrycode="CL" value="Chile (+56)">
                            Chile (+56)
                          </option>
                          <option data-countrycode="CN" value="China (+86)">
                            China (+86)
                          </option>
                          <option data-countrycode="CO" value="Colombia (+57)">
                            Colombia (+57)
                          </option>
                          <option data-countrycode="KM" value="Comoros (+269)">
                            Comoros (+269)
                          </option>
                          <option data-countrycode="CG" value="Congo (+242)">
                            Congo (+242)
                          </option>
                          <option
                            data-countrycode="CK"
                            value="Cook Islands (+682)"
                          >
                            Cook Islands (+682)
                          </option>
                          <option
                            data-countrycode="CR"
                            value="Costa Rica (+506)"
                          >
                            Costa Rica (+506)
                          </option>
                          <option data-countrycode="HR" value="Croatia (+385)">
                            Croatia (+385)
                          </option>
                          <option data-countrycode="CU" value="Cuba (+53)">
                            Cuba (+53)
                          </option>
                          <option
                            data-countrycode="CY"
                            value="Cyprus North (+90392)"
                          >
                            Cyprus North (+90392)
                          </option>
                          <option
                            data-countrycode="CY"
                            value="Cyprus South (+357)"
                          >
                            Cyprus South (+357)
                          </option>
                          <option
                            data-countrycode="CZ"
                            value="Czech Republic (+42)"
                          >
                            Czech Republic (+42)
                          </option>
                          <option data-countrycode="DK" value="Denmark (+45)">
                            Denmark (+45)
                          </option>
                          <option data-countrycode="DJ" value="Djibouti (+253)">
                            Djibouti (+253)
                          </option>
                          <option
                            data-countrycode="DM"
                            value="Dominica (+1809)"
                          >
                            Dominica (+1809)
                          </option>
                          <option
                            data-countrycode="DO"
                            value="Dominican Republic (+1809)"
                          >
                            Dominican Republic (+1809)
                          </option>
                          <option data-countrycode="EC" value="Ecuador (+593)">
                            Ecuador (+593)
                          </option>
                          <option data-countrycode="EG" value="Egypt (+20)">
                            Egypt (+20)
                          </option>
                          <option
                            data-countrycode="SV"
                            value="El Salvador (+503)"
                          >
                            El Salvador (+503)
                          </option>
                          <option
                            data-countrycode="GQ"
                            value="Equatorial Guinea (+240)"
                          >
                            Equatorial Guinea (+240)
                          </option>
                          <option data-countrycode="ER" value="Eritrea (+291)">
                            Eritrea (+291)
                          </option>
                          <option data-countrycode="EE" value="Estonia (+372)">
                            Estonia (+372)
                          </option>
                          <option data-countrycode="ET" value="Ethiopia (+251)">
                            Ethiopia (+251)
                          </option>
                          <option
                            data-countrycode="FK"
                            value="Falkland Islands (+500)"
                          >
                            Falkland Islands (+500)
                          </option>
                          <option
                            data-countrycode="FO"
                            value="Faroe Islands (+298)"
                          >
                            Faroe Islands (+298)
                          </option>
                          <option data-countrycode="FJ" value="Fiji (+679)">
                            Fiji (+679)
                          </option>
                          <option data-countrycode="FI" value="Finland (+358)">
                            Finland (+358)
                          </option>
                          <option data-countrycode="FR" value="France (+33)">
                            France (+33)
                          </option>
                          <option
                            data-countrycode="GF"
                            value="French Guiana (+594)"
                          >
                            French Guiana (+594)
                          </option>
                          <option
                            data-countrycode="PF"
                            value="French Polynesia (+689)"
                          >
                            French Polynesia (+689)
                          </option>
                          <option data-countrycode="GA" value="Gabon (+241)">
                            Gabon (+241)
                          </option>
                          <option data-countrycode="GM" value="Gambia (+220)">
                            Gambia (+220)
                          </option>
                          <option data-countrycode="GE" value="Georgia (+7880)">
                            Georgia (+7880)
                          </option>
                          <option data-countrycode="DE" value="Germany (+49)">
                            Germany (+49)
                          </option>
                          <option data-countrycode="GH" value="Ghana (+233)">
                            Ghana (+233)
                          </option>
                          <option
                            data-countrycode="GI"
                            value="Gibraltar (+350)"
                          >
                            Gibraltar (+350)
                          </option>
                          <option data-countrycode="GR" value="Greece (+30)">
                            Greece (+30)
                          </option>
                          <option
                            data-countrycode="GL"
                            value="Greenland (+299)"
                          >
                            Greenland (+299)
                          </option>
                          <option data-countrycode="GD" value="Grenada (+1473)">
                            Grenada (+1473)
                          </option>
                          <option
                            data-countrycode="GP"
                            value="Guadeloupe (+590)"
                          >
                            Guadeloupe (+590)
                          </option>
                          <option data-countrycode="GU" value="Guam (+671)">
                            Guam (+671)
                          </option>
                          <option
                            data-countrycode="GT"
                            value="Guatemala (+502)"
                          >
                            Guatemala (+502)
                          </option>
                          <option data-countrycode="GN" value="Guinea (+224)">
                            Guinea (+224)
                          </option>
                          <option
                            data-countrycode="GW"
                            value="Guinea - Bissau (+245)"
                          >
                            Guinea - Bissau (+245)
                          </option>
                          <option data-countrycode="GY" value="Guyana (+592)">
                            Guyana (+592)
                          </option>
                          <option data-countrycode="HT" value="Haiti (+509)">
                            Haiti (+509)
                          </option>
                          <option data-countrycode="HN" value="Honduras (+504)">
                            Honduras (+504)
                          </option>
                          <option
                            data-countrycode="HK"
                            value="Hong Kong (+852)"
                          >
                            Hong Kong (+852)
                          </option>
                          <option data-countrycode="HU" value="Hungary (+36)">
                            Hungary (+36)
                          </option>
                          <option data-countrycode="IS" value="Iceland (+354)">
                            Iceland (+354)
                          </option>
                          <option data-countrycode="IN" value="India (+91)">
                            India (+91)
                          </option>
                          <option data-countrycode="ID" value="Indonesia (+62)">
                            Indonesia (+62)
                          </option>
                          <option data-countrycode="IR" value="Iran (+98)">
                            Iran (+98)
                          </option>
                          <option data-countrycode="IQ" value="Iraq (+964)">
                            Iraq (+964)
                          </option>
                          <option data-countrycode="IE" value="Ireland (+353)">
                            Ireland (+353)
                          </option>
                          <option data-countrycode="IL" value="Israel (+972)">
                            Israel (+972)
                          </option>
                          <option data-countrycode="IT" value="Italy (+39)">
                            Italy (+39)
                          </option>
                          <option data-countrycode="JM" value="Jamaica (+1876)">
                            Jamaica (+1876)
                          </option>
                          <option data-countrycode="JP" value="Japan (+81)">
                            Japan (+81)
                          </option>
                          <option data-countrycode="JO" value="Jordan (+962)">
                            Jordan (+962)
                          </option>
                          <option data-countrycode="KZ" value="Kazakhstan (+7)">
                            Kazakhstan (+7)
                          </option>
                          <option data-countrycode="KE" value="Kenya (+254)">
                            Kenya (+254)
                          </option>
                          <option data-countrycode="KI" value="Kiribati (+686)">
                            Kiribati (+686)
                          </option>
                          <option
                            data-countrycode="KP"
                            value="Korea North (+850)"
                          >
                            Korea North (+850)
                          </option>
                          <option
                            data-countrycode="KR"
                            value="Korea South (+82)"
                          >
                            Korea South (+82)
                          </option>
                          <option data-countrycode="KW" value="Kuwait (+965)">
                            Kuwait (+965)
                          </option>
                          <option
                            data-countrycode="KG"
                            value="Kyrgyzstan (+996)"
                          >
                            Kyrgyzstan (+996)
                          </option>
                          <option data-countrycode="LA" value="Laos (+856)">
                            Laos (+856)
                          </option>
                          <option data-countrycode="LV" value="Latvia (+371)">
                            Latvia (+371)
                          </option>
                          <option data-countrycode="LB" value="Lebanon (+961)">
                            Lebanon (+961)
                          </option>
                          <option data-countrycode="LS" value="Lesotho (+266)">
                            Lesotho (+266)
                          </option>
                          <option data-countrycode="LR" value="Liberia (+231)">
                            Liberia (+231)
                          </option>
                          <option data-countrycode="LY" value="Libya (+218)">
                            Libya (+218)
                          </option>
                          <option
                            data-countrycode="LI"
                            value="Liechtenstein (+417)"
                          >
                            Liechtenstein (+417)
                          </option>
                          <option
                            data-countrycode="LT"
                            value="Lithuania (+370)"
                          >
                            Lithuania (+370)
                          </option>
                          <option
                            data-countrycode="LU"
                            value="Luxembourg (+352)"
                          >
                            Luxembourg (+352)
                          </option>
                          <option data-countrycode="MO" value="Macao (+853)">
                            Macao (+853)
                          </option>
                          <option
                            data-countrycode="MK"
                            value="Macedonia (+389)"
                          >
                            Macedonia (+389)
                          </option>
                          <option
                            data-countrycode="MG"
                            value="Madagascar (+261)"
                          >
                            Madagascar (+261)
                          </option>
                          <option data-countrycode="MW" value="Malawi (+265)">
                            Malawi (+265)
                          </option>
                          <option data-countrycode="MY" value="Malaysia (+60)">
                            Malaysia (+60)
                          </option>
                          <option data-countrycode="MV" value="Maldives (+960)">
                            Maldives (+960)
                          </option>
                          <option data-countrycode="ML" value="Mali (+223)">
                            Mali (+223)
                          </option>
                          <option data-countrycode="MT" value="Malta (+356)">
                            Malta (+356)
                          </option>
                          <option
                            data-countrycode="MH"
                            value="Marshall Islands (+692)"
                          >
                            Marshall Islands (+692)
                          </option>
                          <option
                            data-countrycode="MQ"
                            value="Martinique (+596)"
                          >
                            Martinique (+596)
                          </option>
                          <option
                            data-countrycode="MR"
                            value="Mauritania (+222)"
                          >
                            Mauritania (+222)
                          </option>
                          <option data-countrycode="YT" value="Mayotte (+269)">
                            Mayotte (+269)
                          </option>
                          <option data-countrycode="MX" value="Mexico (+52)">
                            Mexico (+52)
                          </option>
                          <option
                            data-countrycode="FM"
                            value="Micronesia (+691)"
                          >
                            Micronesia (+691)
                          </option>
                          <option data-countrycode="MD" value="Moldova (+373)">
                            Moldova (+373)
                          </option>
                          <option data-countrycode="MC" value="Monaco (+377)">
                            Monaco (+377)
                          </option>
                          <option data-countrycode="MN" value="Mongolia (+976)">
                            Mongolia (+976)
                          </option>
                          <option
                            data-countrycode="MS"
                            value="Montserrat (+1664)"
                          >
                            Montserrat (+1664)
                          </option>
                          <option data-countrycode="MA" value="Morocco (+212)">
                            Morocco (+212)
                          </option>
                          <option
                            data-countrycode="MZ"
                            value="Mozambique (+258)"
                          >
                            Mozambique (+258)
                          </option>
                          <option data-countrycode="MN" value="Myanmar (+95)">
                            Myanmar (+95)
                          </option>
                          <option data-countrycode="NA" value="Namibia (+264)">
                            Namibia (+264)
                          </option>
                          <option data-countrycode="NR" value="Nauru (+674)">
                            Nauru (+674)
                          </option>
                          <option data-countrycode="NP" value="Nepal (+977)">
                            Nepal (+977)
                          </option>
                          <option
                            data-countrycode="NL"
                            value="Netherlands (+31)"
                          >
                            Netherlands (+31)
                          </option>
                          <option
                            data-countrycode="NC"
                            value="New Caledonia (+687)"
                          >
                            New Caledonia (+687)
                          </option>
                          <option
                            data-countrycode="NZ"
                            value="New Zealand (+64)"
                          >
                            New Zealand (+64)
                          </option>
                          <option
                            data-countrycode="NI"
                            value="Nicaragua (+505)"
                          >
                            Nicaragua (+505)
                          </option>
                          <option data-countrycode="NE" value="Niger (+227)">
                            Niger (+227)
                          </option>
                          <option data-countrycode="NG" value="Nigeria (+234)">
                            Nigeria (+234)
                          </option>
                          <option data-countrycode="NU" value="Niue (+683)">
                            Niue (+683)
                          </option>
                          <option
                            data-countrycode="NF"
                            value="Norfolk Islands (+672)"
                          >
                            Norfolk Islands (+672)
                          </option>
                          <option
                            data-countrycode="NP"
                            value="Northern Marianas  (+670)"
                          >
                            Northern Marianas (+670)
                          </option>
                          <option data-countrycode="NO" value="Norway (+47)">
                            Norway (+47)
                          </option>
                          <option data-countrycode="OM" value="Oman (+968)">
                            Oman (+968)
                          </option>
                          <option data-countrycode="PW" value="Palau (+680)">
                            Palau (+680)
                          </option>
                          <option data-countrycode="PA" value="Panama (+507)">
                            Panama (+507)
                          </option>
                          <option
                            data-countrycode="PG"
                            value="Papua New Guinea (+675)"
                          >
                            Papua New Guinea (+675)
                          </option>
                          <option data-countrycode="PY" value="Paraguay (+595)">
                            Paraguay (+595)
                          </option>
                          <option data-countrycode="PE" value="Peru (+51)">
                            Peru (+51)
                          </option>
                          <option
                            data-countrycode="PH"
                            value="Philippines (+63)"
                          >
                            Philippines (+63)
                          </option>
                          <option data-countrycode="PL" value="Poland (+48)">
                            Poland (+48)
                          </option>
                          <option data-countrycode="PT" value="Portugal (+351)">
                            Portugal (+351)
                          </option>
                          <option
                            data-countrycode="PR"
                            value="Puerto Rico (+1787)"
                          >
                            Puerto Rico (+1787)
                          </option>
                          <option data-countrycode="QA" value="Qatar (+974)">
                            Qatar (+974)
                          </option>
                          <option data-countrycode="RE" value="Reunion (+262)">
                            Reunion (+262)
                          </option>
                          <option data-countrycode="RO" value="Romania (+40)">
                            Romania (+40)
                          </option>
                          <option data-countrycode="RU" value="Russia (+7)">
                            Russia (+7)
                          </option>
                          <option data-countrycode="RW" value="Rwanda (+250)">
                            Rwanda (+250)
                          </option>
                          <option data-countrycode="SM" value="378">
                            San Marino (+378)
                          </option>
                          <option
                            data-countrycode="ST"
                            value="Sao Tome & Principe (+239)"
                          >
                            Sao Tome & Principe (+239)
                          </option>
                          <option
                            data-countrycode="SA"
                            value="Saudi Arabia (+966)"
                          >
                            Saudi Arabia (+966)
                          </option>
                          <option data-countrycode="SN" value="Senegal (+221)">
                            Senegal (+221)
                          </option>
                          <option data-countrycode="CS" value="Serbia (+381)">
                            Serbia (+381)
                          </option>
                          <option
                            data-countrycode="SC"
                            value="Seychelles (+248)"
                          >
                            Seychelles (+248)
                          </option>
                          <option
                            data-countrycode="SL"
                            value="Sierra Leone (+232)"
                          >
                            Sierra Leone (+232)
                          </option>
                          <option data-countrycode="SG" value="Singapore (+65)">
                            Singapore (+65)
                          </option>
                          <option
                            data-countrycode="SK"
                            value="Slovak Republic (+421)"
                          >
                            Slovak Republic (+421)
                          </option>
                          <option data-countrycode="SI" value="Slovenia (+386)">
                            Slovenia (+386)
                          </option>
                          <option
                            data-countrycode="SB"
                            value="Solomon Islands (+677)"
                          >
                            Solomon Islands (+677)
                          </option>
                          <option data-countrycode="SO" value="Somalia (+252)">
                            Somalia (+252)
                          </option>
                          <option
                            data-countrycode="ZA"
                            value="South Africa (+27)"
                          >
                            South Africa (+27)
                          </option>
                          <option data-countrycode="ES" value="Spain (+34)">
                            Spain (+34)
                          </option>
                          <option data-countrycode="LK" value="Sri Lanka (+94)">
                            Sri Lanka (+94)
                          </option>
                          <option
                            data-countrycode="SH"
                            value="St. Helena (+290)"
                          >
                            St. Helena (+290)
                          </option>
                          <option
                            data-countrycode="KN"
                            value="St. Kitts (+1869)"
                          >
                            St. Kitts (+1869)
                          </option>
                          <option
                            data-countrycode="SC"
                            value="St. Lucia (+1758)"
                          >
                            St. Lucia (+1758)
                          </option>
                          <option data-countrycode="SD" value="Sudan (+249)">
                            Sudan (+249)
                          </option>
                          <option data-countrycode="SR" value="Suriname (+597)">
                            Suriname (+597)
                          </option>
                          <option
                            data-countrycode="SZ"
                            value="Swaziland (+268)"
                          >
                            Swaziland (+268)
                          </option>
                          <option data-countrycode="SE" value="Sweden (+46)">
                            Sweden (+46)
                          </option>
                          <option
                            data-countrycode="CH"
                            value="Switzerland (+41)"
                          >
                            Switzerland (+41)
                          </option>
                          <option data-countrycode="SI" value="Syria (+963)">
                            Syria (+963)
                          </option>
                          <option data-countrycode="TW" value="Taiwan (+886)">
                            Taiwan (+886)
                          </option>
                          <option data-countrycode="TJ" value="Tajikstan (+7)">
                            Tajikstan (+7)
                          </option>
                          <option data-countrycode="TH" value="Thailand (+66)">
                            Thailand (+66)
                          </option>
                          <option data-countrycode="TG" value="Togo (+228)">
                            Togo (+228)
                          </option>
                          <option data-countrycode="TO" value="Tonga (+676)">
                            Tonga (+676)
                          </option>
                          <option
                            data-countrycode="TT"
                            value="Trinidad & Tobago (+1868)"
                          >
                            Trinidad &amp; Tobago (+1868)
                          </option>
                          <option data-countrycode="TN" value="Tunisia (+216)">
                            Tunisia (+216)
                          </option>
                          <option data-countrycode="TR" value="Turkey (+90)">
                            Turkey (+90)
                          </option>
                          <option
                            data-countrycode="TM"
                            value="Turkmenistan (+7)"
                          >
                            Turkmenistan (+7)
                          </option>
                          <option
                            data-countrycode="TM"
                            value="Turkmenistan (+993)"
                          >
                            Turkmenistan (+993)
                          </option>
                          <option
                            data-countrycode="TC"
                            value="Turks & Caicos Islands (+1649)"
                          >
                            Turks &amp; Caicos Islands (+1649)
                          </option>
                          <option data-countrycode="TV" value="Tuvalu (+688)">
                            Tuvalu (+688)
                          </option>
                          <option data-countrycode="UG" value="Uganda (+256)">
                            Uganda (+256)
                          </option>
                          <option data-countrycode="GB" value="UK (+44)">
                            UK (+44)
                          </option>
                          <option data-countrycode="UA" value="Ukraine (+380)">
                            Ukraine (+380)
                          </option>
                          <option
                            data-countrycode="AE"
                            value="United Arab Emirates (+971)"
                          >
                            United Arab Emirates (+971)
                          </option>
                          <option data-countrycode="UY" value="Uruguay (+598)">
                            Uruguay (+598)
                          </option>
                          <option data-countrycode="US" value="USA (+1)">
                            USA (+1)
                          </option>
                          <option data-countrycode="UZ" value="Uzbekistan (+7)">
                            Uzbekistan (+7)
                          </option>
                          <option data-countrycode="VU" value="Vanuatu (+678)">
                            Vanuatu (+678)
                          </option>
                          <option
                            data-countrycode="VA"
                            value="Vatican City (+379)"
                          >
                            Vatican City (+379)
                          </option>
                          <option data-countrycode="VE" value="Venezuela (+58)">
                            Venezuela (+58)
                          </option>
                          <option data-countrycode="VN" value="Vietnam (+84)">
                            Vietnam (+84)
                          </option>
                          <option
                            data-countrycode="VG"
                            value="Virgin Islands - British (+1284)"
                          >
                            Virgin Islands - British (+1284)
                          </option>
                          <option
                            data-countrycode="VI"
                            value="Virgin Islands - US (+1340)"
                          >
                            Virgin Islands - US (+1340)
                          </option>
                          <option
                            data-countrycode="WF"
                            value="Wallis &amp; Futuna (+681)"
                          >
                            Wallis &amp; Futuna (+681)
                          </option>
                          <option
                            data-countrycode="YE"
                            value="Yemen (North)(+969)"
                          >
                            Yemen (North)(+969)
                          </option>
                          <option
                            data-countrycode="YE"
                            value="Yemen (South)(+967)"
                          >
                            Yemen (South)(+967)
                          </option>
                          <option data-countrycode="ZM" value="Zambia (+260)">
                            Zambia (+260)
                          </option>
                          <option data-countrycode="ZW" value="Zimbabwe (+263)">
                            Zimbabwe (+263)
                          </option>
                        </optgroup>
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
                      {loader2 ? (
                        <Loader className="animate-spin" />
                      ) : (
                        "Save and Published"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 */}

            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditPlot;
