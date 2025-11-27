import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
  plotProperties: "",
};

const ViewPlotDialog = ({
  open,
  onOpenChange,
  setViewDialog,
  loading,
  plotId,
}) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [plotData, setPlotData] = useState(plotInfo);
  const [allDetails, setAllDetails] = useState(null);
  const [loader, setLoader] = useState(false);

  const chief_area = user?.publicMetadata.area;
  let database_name;

  if (chief_area === "asokore_mampong") {
    database_name = "asokore_mampong";
  } else if (chief_area === "legon_hills") {
    database_name = "legon_hills";
  } else if (chief_area === "royal_court_estate") {
    database_name = "saadi";
  }

  useEffect(() => {
    if (!isSignedIn || !database_name) return;

    const fetchPlotDetails = async () => {
      setLoader(true);
      try {
        const { data, error } = await supabase
          .from(database_name)
          .select("*")
          .eq("id", plotId);

        if (error) throw error;

        if (data && data[0]) {
          setAllDetails(data[0]);
          setPlotData({
            firstname: data[0].firstname || "",
            lastname: data[0].lastname || "",
            email: data[0].email || "",
            residentialAddress: data[0].residentialAddress || "",
            country: data[0].country || "",
            phone: data[0].phone || "",
            agent: data[0].agent || "",
            plotTotalAmount: data[0].plotTotalAmount || 0,
            paidAmount: data[0].paidAmount || 0,
            remainingAmount: data[0].remainingAmount || 0,
            remarks: data[0].remarks || "",
            plotStatus: data[0].status || "",
          });
        } else {
          console.log("Plot details unavailable");
          toast.error("Plot details not found");
        }
      } catch (error) {
        console.error("Error fetching plot details:", error);
        toast.error("Failed to fetch plot details");
      } finally {
        setLoader(false);
      }
    };

    fetchPlotDetails();
  }, [isSignedIn, user, plotId, database_name]);

  console.log(allDetails?.plotTotalAmount.toLocaleString())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>View Plot</DialogTitle>
          <DialogDescription>View the plot details</DialogDescription>
        </DialogHeader>

        {loader ? (
          <div className="flex flex-col justify-center items-center py-8">
            <Loader className="animate-spin text-primary" size={32} />
            <p className="mt-2">Loading plot details...</p>
          </div>
        ) : allDetails ? (
          <div className="grid gap-4 py-4">
            {/* Plot Details */}
            <div className="grid gap-2">
              <Label htmlFor="plot-details">Plot Details</Label>
              <Input
                id="plot-details"
                defaultValue={`Plot Number ${
                  allDetails?.properties?.Plot_No || "N/A"
                } - ${allDetails?.properties?.Street_Nam || "N/A"}`}
                readOnly
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="grid gap-2">
                <Label htmlFor="plot_size">Plot Size</Label>
                <Input
                  id="plot_size"
                  defaultValue={
                    user?.publicMetadata?.area === "legon_hills"
                      ? `${(allDetails?.properties?.Area || 0).toFixed(
                          2
                        )} Acres`
                      : user?.publicMetadata?.area === "asokore_mampong"
                      ? `${(allDetails?.properties?.Area || 0).toFixed(
                          2
                        )} Acres`
                      : `${(allDetails?.properties?.Area || 0).toFixed(
                          2
                        )} Acres`
                  }
                  readOnly
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Plot Status</Label>
                <Input
                  id="status"
                  defaultValue={plotData.plotStatus}
                  readOnly
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstname">First Name</Label>
                <Input
                  id="firstname"
                  defaultValue={plotData.firstname}
                  readOnly
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastname">Last Name</Label>
                <Input
                  id="lastname"
                  defaultValue={plotData.lastname}
                  readOnly
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={plotData.email}
                readOnly
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue={plotData.phone} readOnly />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Residential Address</Label>
              <Input
                id="address"
                defaultValue={plotData.residentialAddress}
                readOnly
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" defaultValue={plotData.country} readOnly />
            </div>

            {/* Financial Information */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="total-amount">Total Amount</Label>
                <Input
                  id="total-amount"
                  type="text"
                  className="text-black font-semibold"
                  value={allDetails?.plotTotalAmount.toLocaleString()}
                  readOnly
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="paid-amount">Paid Amount</Label>
                <Input
                  id="paid-amount"
                  type="text"
                  value={allDetails?.paidAmount.toLocaleString()}
                  readOnly
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="remaining-amount">Remaining Amount</Label>
                <Input
                  id="remaining-amount"
                  type="text"
                  className="text-black font-semibold"
                  value={allDetails?.remainingAmount.toLocaleString()}
                  readOnly
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No plot details found.</p>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewPlotDialog;
