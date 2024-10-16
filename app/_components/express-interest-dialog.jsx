"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Loader, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "react-toastify";
import { Textarea } from "@/components/ui/textarea";
import { toast as sonarToast } from "sonner";
import OptGroup from "../(dashboard)/dashboard/_components/OptGroup";

const customerInfo = {
  firstname: "",
  lastname: "",
  email: "",
  country: "",
  phone: "",
  message: "",
};

//View Plot Dialog
export function ExpressInterestDialog({
  open,
  onOpenChange,
  plotId,
  setIsDialogOpen,
  table,
}) {
  const [loader2, setLoader2] = useState(false);
  const [customerData, setCustomerData] = useState(customerInfo);
  const [allDetails, setAllDetails] = useState();
  const [plotDataLoading, setPlotDataLoading] = useState(false);

  const { firstname, lastname, phone, email, country, message } = customerData;

  const [loading, setLoading] = useState(false);

  // Errors Checks
  const [fnameEr, setFnameEr] = useState(false);
  const [lnameEr, setLnameEr] = useState(false);
  const [emailEr, setEmailEr] = useState(false);
  const [countryEr, setCountryEr] = useState(false);
  const [phoneEr, setPhoneEr] = useState(false);
  const [messageEr, setMessageEr] = useState(false);

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

  useEffect(() => {
    if (plotId && databaseName) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from(databaseName)
            .select("*")
            .eq("id", plotId);

          if (data) {
            setPlotDataLoading(false);
            setAllDetails(data[0]);
          }
          if (error) {
            setPlotDataLoading(false);
            toast.error("Error occurred fetching plot details");
            console.log(error);
          }
        } catch (error) {
          setPlotDataLoading(false);
          console.log(error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      toast.error("Please Try again later");
    }
  }, [plotId, databaseName]);

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
    if (message === null || message === undefined || message === "") {
      setMessageEr(true);
      toast.error("Add Message to send");
      return;
    } else if (message.length < 5) {
      setMessageEr(false);
      toast.error("Add more Characters");
      return;
    } else {
      setMessageEr(false); //
    }

    //insert data
    if (plotId && allDetails.id) {
      setLoader2(true);
      const { data, error } = await supabase
        .from(databaseInterest)
        .insert({
          firstname: customerData.firstname,
          lastname: customerData.lastname,
          email: customerData.email,
          country: customerData.country,
          phone: customerData.phone,
          plotId: allDetails.id,
          plot_number: allDetails.properties.Plot_No,
          plot_name: allDetails.properties.Street_Nam,
          plot_amount: allDetails.plotTotalAmount,
          message: customerData.message,
        })
        .select();

      if (data) {
        //Send Mail
       try {
        const res = await fetch("/api/mail-from-interests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstname: customerData.firstname,
            lastname: customerData.lastname,
            email: customerData.email,
            country: customerData.country,
            phone: customerData.phone,
            plot_number: allDetails.properties.Plot_No,
            plot_name: allDetails.properties.Street_Nam,
            plot_amount: allDetails.plotTotalAmount,
            message: customerData.message,
          }),
        });
       } catch (error) {
        console.log(error)
       }

        sonarToast(
          "Messge Sent Successfully, We will get in touch with you soon"
        );
        toast.success(
          "Messge Sent Successfully, We will get in touch with you soon"
        );
        setLoader2(false);
        setIsDialogOpen(false);
      }
      if (error) {
        console.log(error);
        toast.error("Sorry errror happened with the plot details");
        setLoader2(false);
      }
    } else {
      toast.error("Please Try again later");
    }
  };

  const handleInputChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setCustomerData({ ...customerData, [name]: value });
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
      <DialogContent className="w-[95vw]">
        <DialogHeader>
          <DialogTitle className="font-bold">Express Interest</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Send us a message and we will give you a special arrangement on how to
          get this plot.
        </DialogDescription>
        <hr />
        <div>
          {plotDataLoading && (
            <div className="flex flex-col justify-center items-center">
              <Loader className="animate-spin text-primary z-50" />
            </div>
          )}
          {loading && (
            <div className="flex p-8 items-center flex-col justify-center">
              <span>Loading...</span>
            </div>
          )}
          {allDetails && (
            <form onSubmit={handleFormSubmit}>
              <div className="pt-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex gap-2 items-center">
                    <p className="text-gray-900 font-semibold text-sm w-1/4">
                      Plot Details
                    </p>
                    <Input
                      type="text"
                      disabled
                      name="plotDetails"
                      className="w-3/4 text-primary"
                      value={
                        "Plot Number " +
                        allDetails?.properties?.Plot_No +
                        " " +
                        allDetails?.properties?.Street_Nam
                      }
                    />
                    <small className="text-red-800"></small>
                  </div>
                  <div className="flex">
                    <div className="flex gap-1 items-center">
                      <p className="text-gray-900 font-semibold text-sm w-1/4">
                        Status
                      </p>
                      <Input
                        type="text"
                        disabled
                        className="w-3/4 text-primary"
                        name="plotStatus"
                        value={allDetails.status ?? "Available"}
                      />
                    </div>

                    <div className="flex gap-1 items-center">
                      <h2 className="text-gray-900 font-semibold w-1/4 text-sm">
                        Amount GHS
                      </h2>
                      <div className="w-3/4">
                        <Input
                          className="text-primary"
                          disabled
                          placeholder="Plot Total Amount"
                          name="plotTotalAmount"
                          type="number"
                          value={allDetails.plotTotalAmount}
                        />
                      </div>
                    </div>
                  </div>

                  <hr />
                  <div className=" flex items-center space-x-2">
                    <h2 className="text-gray-900 font-semibold text-sm w-1/4">
                      First Name:
                    </h2>
                    <Input
                      type="text"
                      placeholder="First Name"
                      name="firstname"
                      onChange={handleInputChange}
                      value={firstname}
                      style={{ border: fnameEr && `1px solid red` }}
                      className="w-3/4"
                    />
                    {fnameEr && (
                      <small className="text-red-900">
                        Enter your firstname
                      </small>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <h2 className="text-gray-900 font-semibold text-sm w-1/4">
                      Last Name(s)
                    </h2>
                    <Input
                      type="text"
                      name="lastname"
                      placeholder="Last Name(s)"
                      onChange={handleInputChange}
                      value={lastname}
                      style={{ border: lnameEr && `1px solid red` }}
                      className="w-3/4"
                    />
                    {lnameEr && (
                      <small className="text-red-900">
                        Enter your last name(s)
                      </small>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <h2 className="text-gray-900 font-semibold text-sm w-1/4">
                      Email
                    </h2>
                    <Input
                      placeholder="Email Address"
                      name="email"
                      type="email"
                      onChange={handleInputChange}
                      value={email}
                      style={{ border: emailEr && `1px solid red` }}
                      className="w-3/4"
                    />
                    {emailEr && (
                      <small className="text-red-900">Enter your email</small>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <h2 className="text-gray-900 font-semibold text-sm w-1/4">
                      Country
                    </h2>
                    <select
                      onChange={handleInputChange}
                      className="py-[9px] bg-white rounded-md text-dark border px-2 w-3/4"
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

                  <div className="flex items-center space-x-2">
                    <h2 className="text-gray-900 font-semibold text-sm w-1/4">
                      Contact
                    </h2>
                    <Input
                      placeholder="Phone Number"
                      name="phone"
                      type="number"
                      onChange={handleInputChange}
                      value={phone}
                      onKeyPress={handleInput}
                      style={{ border: phoneEr && `1px solid red` }}
                      className="w-3/4"
                    />
                    {phoneEr && (
                      <small className="text-red-900">Enter Phone Number</small>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h2 className="text-gray-900 font-semibold text-sm mb-2">
                    Message
                  </h2>
                  <Textarea
                    onChange={handleInputChange}
                    name="message"
                    value={message}
                  />
                  {messageEr && (
                    <small className="text-red-900">Add Message</small>
                  )}
                </div>

                <div className="flex items-center justify-center md:justify-end lg:justify-end gap-6 mt-7 pb-2">
                  <button
                    type="submit"
                    className="bg-primary text-white py-2 px-4 rounded-md shadow-md"
                  >
                    {loader2 ? (
                      <Loader className="animate-spin" />
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
