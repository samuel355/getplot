import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import OptGroup from "../(dashboard)/dashboard/_components/OptGroup";
import { Button } from "@/components/ui/button";
import { buyPlotNew } from "../_actions/buy-plot-new";

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

const BuyPlotDialog = ({
  open,
  onOpenChange,
  plotId,
  setBuyPlotDialog,
  table,
}) => {
  let databaseName;
  let databaseInterest;
  if (table && table === "nthc") {
    databaseName = "nthc";
    databaseInterest = "nthc_interests";
  }
  if (table && table === "dar-es-salaam") {
    databaseName = "dar_es_salaam";
    databaseInterest = "dar_es_salaam_interests";
  }
  if (table && table === "trabuom") {
    databaseName = "trabuom";
    databaseInterest = "trabuom_interests";
  }
  if (table && table === "legon-hills") {
    databaseName = "legon_hills";
    databaseInterest = "legon_hills_interests";
  }
  if (table && table === "yabi") {
    databaseName = "yabi";
    databaseInterest = "yabi_interests";
  }
  if (table && table === "berekuso") {
    databaseName = "berekuso";
    databaseInterest = "berekuso_interests";
  }
  if (table && table === "asokore-mampong") {
    databaseName = "asokore_mampong";
    databaseInterest = "asokore_mampong_interests";
  }
  if (table && table === "saadi") {
    databaseName = "saadi";
    databaseInterest = "saadi_interests";
  }

  const [loading, setLoading] = useState(false);
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
    if (plotId && databaseName) {
      fetchPlotData();
    }
  }, [plotId, databaseName]);

  //Fetch Plot Details From DB
  const fetchPlotData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(databaseName)
        .select("*")
        .eq("id", plotId);

      if (data) {
        setLoading(false);
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
        setLoading(false);
        toast("Something went wrong fetching plot data");
        return;
      }
      if (error) {
        setLoading(false);
        console.log(error);
        toast("Something went wrong fetching plot data");
        setBuyPlotDialog(false);
        return;
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast("Something went wrong fetching plot data");
      setBuyPlotDialog(false);
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

  const handleFormSubmit = async (e) => {
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buy Plot</DialogTitle>
          <DialogDescription>Fill in the details to buy plot</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-8">
            <Loader className="animate-spin text-primary" size={24} />
            <p className="mt-2 text-sm">Please Wait...</p>
          </div>
        ) : allDetails ? (
          <form onSubmit={handleFormSubmit}>
            <div className="pt-2">
              <div className="w-full">
                <h2 className="text-gray-900 font-semibold">Plot Details</h2>
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
              <div className="grid grid-cols-2 gap-4 items-center mt-3">
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

                <div className="">
                  <h2 className="text-gray-900 font-semibold">Amount (GHS)</h2>
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
              {(user?.publicMetadata?.role === "sysadmin" ||
                user?.publicMetadata?.role === "admin") && (
                <div className="mt-6">
                  <h2 className="text-gray-900 font-semibold">Remarks</h2>
                  <Textarea
                    onChange={onInputChange}
                    name="remarks"
                    value={remarks}
                  />
                </div>
              )}
              <hr className="my-4 bg-black" />
              <div className="grid grid-cols-2 gap-4 mt-2">
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
                    <small className="text-red-900">Enter your firstname</small>
                  )}
                </div>
                <div className="">
                  <h2 className="text-gray-900 font-semibold">Last Name(s)</h2>
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
              </div>

              <div className="w-full mt-4">
                <h2 className="text-gray-900 font-semibold">Email Address</h2>
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

              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <h2 className="text-gray-900 font-semibold">Country</h2>
                  <select
                    onChange={onInputChange}
                    className="bg-white rounded-md text-dark border w-full py-4"
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
                    <small className="text-red-900">Selecet your country</small>
                  )}
                </div>

                <div className="">
                  <h2 className="text-gray-900 font-semibold">Phone Number</h2>
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
              </div>

              <div className="grid grid-cols-2 mt-4 gap-4">
                <div className="">
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

                <div className="">
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

              {loading ? (
                <Loader className="animate-spin" />
              ) : (
                <Button
                  className="mt-4"
                  onClick={() =>
                    buyPlotNew(
                      loading,
                      setLoading,
                      allDetails,
                      plotTotalAmount,
                      databaseName,
                      plotId,
                      email,
                      firstname,
                      lastname,
                      phone,
                      country,
                      residentialAddress,
                      table,
                      toast,
                      setBuyPlotDialog
                    )
                  }
                >
                  Buy Plot
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <p>No plot details found.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BuyPlotDialog;
