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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

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

const EditPlotDialog = ({
  open,
  onOpenChange,
  setEditDialog,
  loading,
  plotId,
}) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [plotData, setPlotData] = useState(plotInfo);
  const [allDetails, setAllDetails] = useState(null);
  const [loader, setLoader] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});

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

  // Validate phone number (10 digits only)
  const validatePhone = (phone) => {
    if (!phone) return true; // Phone is optional, only validate if provided
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  // Validate amount (positive number)
  const validateAmount = (amount) => {
    return !isNaN(amount) && parseFloat(amount) >= 0;
  };

  // Validate email format
  const validateEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate required field
  const validateRequired = (value) => {
    return value && value.trim().length > 0;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));

    // Validate required fields
    if (['firstname', 'lastname', 'email', 'residentialAddress', 'country'].includes(field)) {
      if (!validateRequired(value)) {
        setErrors((prev) => ({
          ...prev,
          [field]: "This field is required"
        }));
      }
    }

    // Email validation
    if (field === "email" && value && !validateEmail(value)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address"
      }));
    }

    // Phone validation
    if (field === "phone" && value && !validatePhone(value)) {
      setErrors((prev) => ({
        ...prev,
        phone: "Phone number must be exactly 10 digits",
      }));
    }

    if (field === "paidAmount") {
      const paidAmount = parseFloat(value) || 0;
      const plotTotalAmount = plotData.plotTotalAmount;
      
      if (!validateAmount(value)) {
        setErrors((prev) => ({
          ...prev,
          paidAmount: "Paid amount must be a positive number",
        }));
      } else if (paidAmount > plotTotalAmount) {
        setErrors((prev) => ({
          ...prev,
          paidAmount: "Paid amount cannot exceed total amount",
        }));
      }

      const remainingAmount = plotTotalAmount - paidAmount;
      
      setPlotData((prev) => ({
        ...prev,
        paidAmount,
        remainingAmount: remainingAmount < 0 ? 0 : remainingAmount,
      }));
      return;
    }

    setPlotData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle status change
  const handleStatusChange = (value) => {
    setPlotData((prev) => ({
      ...prev,
      plotStatus: value,
    }));

    // If status is changed to "sold", set paid amount equal to total amount
    if (value === "sold") {
      setPlotData((prev) => ({
        ...prev,
        paidAmount: prev.plotTotalAmount,
        remainingAmount: 0,
      }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!validateRequired(plotData.firstname)) {
      newErrors.firstname = "First name is required";
    }

    if (!validateRequired(plotData.lastname)) {
      newErrors.lastname = "Last name is required";
    }

    if (!validateRequired(plotData.email)) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(plotData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!validateRequired(plotData.residentialAddress)) {
      newErrors.residentialAddress = "Residential address is required";
    }

    if (!validateRequired(plotData.country)) {
      newErrors.country = "Country is required";
    }

    // Phone validation
    if (plotData.phone && !validatePhone(plotData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    // Paid amount validation
    if (!validateAmount(plotData.paidAmount)) {
      newErrors.paidAmount = "Paid amount must be a positive number";
    } else if (plotData.paidAmount > plotData.plotTotalAmount) {
      newErrors.paidAmount = "Paid amount cannot exceed total amount";
    }

    // Status validation - if sold, paid amount must equal total amount
    if (plotData.plotStatus === "sold" && plotData.paidAmount !== plotData.plotTotalAmount) {
      newErrors.paidAmount = "Paid amount must equal total amount when status is 'Sold'";
    }

    // Remaining amount validation
    if (plotData.remainingAmount < 0) {
      newErrors.paidAmount = "Remaining amount cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleUpdate = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors before updating");
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from(database_name)
        .update({
          firstname: plotData.firstname.trim(),
          lastname: plotData.lastname.trim(),
          email: plotData.email.trim(),
          residentialAddress: plotData.residentialAddress.trim(),
          country: plotData.country.trim(),
          phone: plotData.phone,
          agent: plotData.agent,
          paidAmount: plotData.paidAmount,
          remainingAmount: plotData.remainingAmount,
          remarks: plotData.remarks,
          status: plotData.plotStatus,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq("id", plotId);

      if (error) throw error;

      toast.success("Plot details updated successfully");
      onOpenChange(false);
      // You might want to refresh the parent component data here
      
    } catch (error) {
      console.error("Error updating plot details:", error);
      toast.error("Failed to update plot details");
    } finally {
      setUpdating(false);
    }
  };

  // Check if original status is "sold" - then disable status change
  const isOriginalStatusSold = allDetails?.status === "sold";

  // Check if form has any errors
  const hasErrors = Object.keys(errors).length > 0;

  // Check if all required fields are filled
  const isFormValid = 
    validateRequired(plotData.firstname) &&
    validateRequired(plotData.lastname) &&
    validateRequired(plotData.email) &&
    validateEmail(plotData.email) &&
    validateRequired(plotData.residentialAddress) &&
    validateRequired(plotData.country) &&
    (!plotData.phone || validatePhone(plotData.phone)) &&
    validateAmount(plotData.paidAmount) &&
    plotData.paidAmount <= plotData.plotTotalAmount &&
    plotData.remainingAmount >= 0 &&
    !(plotData.plotStatus === "sold" && plotData.paidAmount !== plotData.plotTotalAmount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Plot</DialogTitle>
          <DialogDescription>Update the plot details</DialogDescription>
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
                value={`Plot Number ${
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
                  value={
                    user?.publicMetadata?.area === "legon_hills"
                      ? `${(allDetails?.properties?.Area || 0).toFixed(2)} Acres`
                      : user?.publicMetadata?.area === "asokore_mampong"
                      ? `${(allDetails?.properties?.Area || 0).toFixed(2)} Acres`
                      : `${(allDetails?.properties?.Area || 0).toFixed(2)} Acres`
                  }
                  readOnly
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Plot Status</Label>
                <Select
                  value={plotData.plotStatus}
                  onValueChange={handleStatusChange}
                  disabled={isOriginalStatusSold}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
                {isOriginalStatusSold && (
                  <p className="text-xs text-muted-foreground">
                    Status cannot be changed from "Sold"
                  </p>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstname">First Name *</Label>
                <Input
                  id="firstname"
                  value={plotData.firstname}
                  onChange={(e) => handleInputChange("firstname", e.target.value)}
                  className={errors.firstname ? "border-red-500" : ""}
                />
                {errors.firstname && (
                  <p className="text-sm text-red-500">{errors.firstname}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastname">Last Name *</Label>
                <Input
                  id="lastname"
                  value={plotData.lastname}
                  onChange={(e) => handleInputChange("lastname", e.target.value)}
                  className={errors.lastname ? "border-red-500" : ""}
                />
                {errors.lastname && (
                  <p className="text-sm text-red-500">{errors.lastname}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={plotData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={plotData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="10 digits only (optional)"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Residential Address *</Label>
              <Input
                id="address"
                value={plotData.residentialAddress}
                onChange={(e) => handleInputChange("residentialAddress", e.target.value)}
                className={errors.residentialAddress ? "border-red-500" : ""}
              />
              {errors.residentialAddress && (
                <p className="text-sm text-red-500">{errors.residentialAddress}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={plotData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className={errors.country ? "border-red-500" : ""}
              />
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country}</p>
              )}
            </div>

            {/* Financial Information */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="total-amount">Total Amount</Label>
                <Input
                  id="total-amount"
                  type="text"
                  className="text-black font-semibold"
                  value={plotData.plotTotalAmount.toLocaleString()}
                  readOnly
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="paid-amount">Paid Amount</Label>
                <Input
                  id="paid-amount"
                  type="number"
                  value={plotData.paidAmount}
                  onChange={(e) => handleInputChange("paidAmount", e.target.value)}
                  min="0"
                  max={plotData.plotTotalAmount}
                  className={errors.paidAmount ? "border-red-500" : ""}
                />
                {errors.paidAmount && (
                  <p className="text-sm text-red-500">{errors.paidAmount}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="remaining-amount">Remaining Amount</Label>
                <Input
                  id="remaining-amount"
                  type="text"
                  className="text-black font-semibold"
                  value={plotData.remainingAmount.toLocaleString()}
                  readOnly
                />
              </div>
            </div>

            {/* Remarks */}
            <div className="grid gap-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Input
                id="remarks"
                value={plotData.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                placeholder="Additional notes..."
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No plot details found.</p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={updating}>
              Cancel
            </Button>
          </DialogClose>
          <Button 
            onClick={handleUpdate} 
            disabled={updating || loader || !isFormValid}
          >
            {updating ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Updating...
              </>
            ) : (
              "Update Plot"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlotDialog;