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
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import OptGroup from "../(dashboard)/dashboard/_components/OptGroup";
import { Button } from "@/components/ui/button";
import { reservePlotNew } from "../_actions/reserve-plot-new";

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

const ReservePlotDialog = ({
  open,
  onOpenChange,
  setReservePlotDialog,
  plotId,
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
    initialDeposit,
  } = plotData;

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
        setCalcAmount(data[0].plotTotalAmount);
      } else {
        setLoading(false);
        toast.error("Something went wrong fetching plot data");
        return;
      }
      if (error) {
        setLoading(false);
        console.log(error);
        toast.error("Something went wrong fetching plot data");
        setReservePlotDialog(false);
        return;
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast("Something went wrong fetching plot data");
      setReservePlotDialog(false);
    }
  };

  let initialDepo = 0.25 * plotTotalAmount;

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
        `Check the initial deposit. It must be at least GHS. ${initialDepo.toLocaleString()}`
      );
      return;
    }
    if (initialDeposit > plotTotalAmount) {
      toast.error(
        `Check the initial deposit. It must be greater than the plot amount`
      );
      return;
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
    reservePlotNew(
      loading,
      setLoading,
      allDetails,
      plotTotalAmount,
      initialDeposit,
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
      setReservePlotDialog
    );
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Reserve Plot</DialogTitle>
          <DialogDescription className="text-center">
            Fill in the details to reserve the plot
          </DialogDescription>
        </DialogHeader>

        {/* Form Details */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-8">
            <Loader className="animate-spin text-primary" size={24} />
            <p className="mt-2 text-sm">Please Wait...</p>
          </div>
        ) : allDetails ? (
          <form onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="">
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
              <div className="">
                <h2 className="text-gray-900 font-semibold">Plot Size</h2>
                <Input
                  type="text"
                  disabled
                  name="plotSize"
                  value={
                    parseFloat(allDetails?.properties?.Area).toFixed(2) +
                    " Acres "
                  }
                />
                <small className="text-red-800"></small>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
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
                  <small className="text-red-900">Action needed by Admin</small>
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
                    Initial deposit must be at least 25% Which is GHS.{" "}
                    {initialDepo.toLocaleString()}
                  </small>
                )}
              </div>
            </div>

            <p className="text-primary text-sm font-semibold my-3 text-right">
              You have:
              <span> {` GHS. (${calcAmount.toLocaleString()}) To Pay`} </span>
            </p>
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

            <hr className="my-3 text-primary bg-primary" />
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
            <div className="mt-3">
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

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="">
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

            {(user?.publicMetadata?.role === "syadmin" ||
              user?.publicMetadata?.role === "admin") && (
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
            )}
            {loading ? (
              <Loader className="animate-spin" />
            ) : (
              <Button className="mt-4">Reserve Plot</Button>
            )}
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

export default ReservePlotDialog;
