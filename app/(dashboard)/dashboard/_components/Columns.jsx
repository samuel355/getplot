"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/utils/supabase/client";
import { ArrowUpDown, Loader, MoreHorizontal } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import OptGroup from "./OptGroup";
import Link from "next/link";
import { toast as sonarToast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="-ml-2"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => {
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "Plot_No",
    cell: (info) => info.getValue(),
    className: "text-center w-2",

    header: ({ column }) => {
      return (
        <Button
          className="flex justify-start p-1"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          No.
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "Street_Nam",
    header: ({ column }) => {
      return (
        <Button
          className="text-left"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Street
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          className="flex justify-start p-1"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "firstname",
    header: ({ column }) => {
      return (
        <Button
          className="flex justify-start p-1"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          First Name
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "lastname",
    header: ({ column }) => {
      return (
        <Button
          className="flex justify-start p-1"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          No.
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      );
    },    header: ({ column }) => {
      return (
        <Button
          className="flex justify-start p-1"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Name
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => {
      return (
        <Button
          className="flex justify-start p-1"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Phone
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "plotTotalAmount",
    header: ({ column }) => {
      return (
        <Button
          className="flex justify-start p-1"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Plot Amount
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      let value = row.getValue("plotTotalAmount") ?? 0;
      const amount = parseFloat(value);
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "GHS",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "paidAmount",
    header: ({ column }) => {
      return (
        <Button
          className="flex justify-start p-1"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Paid
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      let value = row.getValue("paidAmount") ?? 0;
      const amount = parseFloat(value);
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "GHS",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "remainingAmount",
    header: ({ column }) => {
      return (
        <Button
          className="flex justify-start p-1"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Remaining
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      let value = row.getValue("remainingAmount") ?? 0;
      const amount = parseFloat(value);
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "GHS",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Action </div>,
    cell: ({ row }) => {
      const rowData = row.original;
      const plotId = rowData.id;
      const pathname = usePathname();

      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [delDialogOpen, setDelDialogOpen] = useState(false);
      const [isViewDialog, setIsViewDialog] = useState(false)

      const [plotData, setPlotData] = useState();
      const [loadingPlot, setLoadingPlot] = useState(false);

      // Determine table from pathname
      let table = "";
      if (pathname === "/dashboard/trabuom") table = "trabuom";
      else if (pathname === "/dashboard/nthc") table = "nthc";
      else if (pathname === "/dashboard/legon-hills") table = "legon-hills";
      else if (pathname === "/dashboard/dar-es-salaam") table = "dar-es-salaam";
      else if (pathname === "/dashboard/yabi") table = "yabi";

      let databaseName;
      if (table && table === "nthc") {
        databaseName = "nthc";
      }
      if (table && table === "dar-es-salaam") {
        databaseName = "dar_es_salaam";
      }
      if (table && table === "trabuom") {
        databaseName = "trabuom";
      }
      if (table && table === "legon-hills") {
        databaseName = "legon_hills";
      }
      if (table && table === "yabi") {
        databaseName = "yabi";
      }

      const handleDeleteDialog = async (event) => {
        event.preventDefault();
        if (plotId !== null) {
          setDelDialogOpen(true);
          setLoadingPlot(true);
          try {
            const { data, error } = await supabase
              .from(databaseName)
              .select("*")
              .eq("id", plotId);
            if (error) {
              console.log(error);
              toast.error("sorry, something went wrong, try again later");
              setLoadingPlot(false);
              return;
            }
            setPlotData(data[0]);
            setLoadingPlot(false);
          } catch (error) {
            console.log(error);
            toast.error("Sorry something went wrong, try again later");
            setLoadingPlot(true);
            setDelDialogOpen(false);
            return;
          }
        } else {
          toast.error("Something went wrong. Try again later");
          setLoadingPlot(false);
          setDelDialogOpen(false);
        }
      };

      return (
        <>
          <div className="flex justify-end">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                  Edit Plot
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsViewDialog(true)}>
                  View Plot
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteDialog}>
                  Delete Plot
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Edit plot dialog */}
          <EditPlotDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            plotId={plotId}
            table={table}
            setIsDialogOpen={setIsDialogOpen}
          />
          
          {/* View plot dialog */}
          <ViewPlotDialog
            open={isViewDialog}
            onOpenChange={setIsViewDialog}
            plotId={plotId}
            table={table}
            setIsDialogOpen={setIsViewDialog}
          />

          {/* Delete Plot dialog */}
          <DeletePlotDialog
            open={delDialogOpen}
            onOpenChange={setDelDialogOpen}
            plotId={plotId}
            setDelDialogOpen={setDelDialogOpen}
            table={table}
            plotData={plotData}
            loading={loadingPlot}
          />
        </>
      );
    },
  },
];

const ViewPlotDialog = ({
  open,
  onOpenChange,
  plotId,
  table,
  setIsDialogOpen,
}) => {
  const [plotData, setPlotData] = useState(plotInfo);
  const [allDetails, setAllDetails] = useState();
  const [plotDataLoading, setPlotDataLoading] = useState(false);

  const [loader1, setLoader1] = useState(false);
  const [loader2, setLoader2] = useState(false);
  const [step1, setStep1] = useState(true);
  const [step2, setStep2] = useState(false);

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

  let databaseName;
  if (table && table === "nthc") {
    databaseName = "nthc";
  }
  if (table && table === "dar-es-salaam") {
    databaseName = "dar_es_salaam";
  }
  if (table && table === "trabuom") {
    databaseName = "trabuom";
  }
  if (table && table === "legon-hills") {
    databaseName = "legon_hills";
  }
  if (table && table === "yabi") {
    databaseName = "yabi";
  }

  useEffect(() => {
    if (plotId && databaseName) {
      setPlotDataLoading(true);
      const fetchPlot = async () => {
        try {
          const { data, error } = await supabase
            .from(databaseName)
            .select("*")
            .eq("id", plotId);
          if (error) {
            toast.error("Something went wrong");
            setPlotDataLoading(false);
            setIsDialogOpen(false);
            console.log(error);
            return;
          }
          if (data[0]) {
            setPlotDataLoading(false);
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
            console.log("Plot details unavailable");
            setPlotDataLoading(false);
          }
        } catch (error) {
          console.log(error);
          toast.error("Sorry try again later");
          setPlotDataLoading(false);
          setIsDialogOpen(false);
          return;
        }
      };

      fetchPlot();
    } else {
      toast.error("Sorry something went wrong");
      setIsDialogOpen(false);
      return;
    }
  }, [plotId, databaseName]);

  // Errors Checks
  const [statusEr, setStatusEr] = useState(false);
  const [plotTotalAmountEr, setPlotTotalAmountEr] = useState(false);
  const [paidAmtEr, setPaidAmtEr] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw]">
        <DialogHeader>
          <DialogTitle className="font-bold text-center">Plot Details</DialogTitle>
        </DialogHeader>

        <div>
          {plotDataLoading && (
            <div className="flex flex-col justify-center items-center">
              <Loader className="animate-spin text-primary z-50" />
            </div>
          )}

          {allDetails && (
            <form>
              {/* Step 1 */}

              {step1 && (
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
                        className="w-3/4"
                        value={
                          "Plot Number " +
                          allDetails?.properties?.Plot_No +
                          " " +
                          allDetails?.properties?.Street_Nam
                        }
                      />
                      <small className="text-red-800"></small>
                    </div>
                    <div className="flex gap-2 items-center">
                      <p className="text-gray-900 font-semibold text-sm w-1/4">
                        Plot Status
                      </p>
                      <Input
                        type="text"
                        disabled
                        className="w-3/4"
                        name="plotStatus"
                        value={plotStatus}
                      />
                      <small className="text-red-900"></small>
                    </div>
                    {
                      allDetails.owner_info !== undefined && (
                        <div className="flex gap-2 items-center">
                          <p className="text-gray-900 font-semibold text-sm w-1/4">
                            Primary Owner
                          </p>
                          <Input
                            type="text"
                            disabled
                            className="w-3/4"
                            name="plotStatus"
                            value={allDetails.owner_info}
                          />
                          <small className="text-red-900"></small>
                        </div>
                      )
                    }
                    
                    <div className="flex gap-2 items-center">
                      <h2 className="text-gray-900 font-semibold w-1/4 text-sm">
                        Total Amount
                      </h2>
                      <div className="w-3/4">
                        <Input
                          placeholder="Plot Total Amount"
                          name="plotTotalAmount"
                          type="number"
                          value={plotTotalAmount}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <h2 className="text-gray-900 font-semibold text-sm w-1/4">
                        Paid Amount
                      </h2>
                      <div className="w-3/4">
                        <Input
                          placeholder="Paid Amount"
                          name="paidAmount"
                          type="number"
                          value={paidAmount}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <h2 className="text-gray-900 font-semibold text-sm w-1/4">
                        Remaining Amount
                      </h2>
                      <Input
                        placeholder="Remaining Amount"
                        name="remainingAmount"
                        type="number"
                        value={remainingAmount}
                        disabled
                        className="w-3/4"
                      />
                      <small className="text-red-800"></small>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h2 className="text-gray-900 font-semibold text-sm mb-2">
                      Remarks
                    </h2>
                    <Textarea
                      name="remarks"
                      value={remarks}
                      disabled
                    />
                  </div>

                  <div className="flex items-center justify-center md:justify-end lg:justify-end gap-6 mt-5">
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
                <div className="pt-4">
                  <div className="flex flex-col space-y-4">
                    <div className=" flex items-center space-x-2">
                      <h2 className="text-gray-900 font-semibold text-sm w-1/4">
                        First Name:
                      </h2>
                      <Input
                        type="text"
                        placeholder="First Name"
                        name="firstname"
                        value={firstname}
                        className="w-3/4"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-gray-900 font-semibold text-sm w-1/4">
                        Last Name(s)
                      </h2>
                      <Input
                        type="text"
                        name="lastname"
                        value={lastname}
                        className="w-3/4"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <h2 className="text-gray-900 font-semibold text-sm w-1/4">
                        Email
                      </h2>
                      <Input
                        placeholder="Email Address"
                        name="email"
                        type="email"
                        value={email}
                        className="w-3/4"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4">

                      <div className="flex items-center space-x-2">
                        <h2 className="text-gray-900 font-semibold text-sm w-1/4">
                          Contact
                        </h2>
                        <Input
                          placeholder="Phone Number"
                          name="phone"
                          type="number"
                          value={phone}
                          className="w-3/4"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 flex-col">
                      <h2 className="text-gray-900 font-semibold text-sm">
                        Residential Address
                      </h2>
                      <Input
                        placeholder="Residential Address"
                        name="residentialAddress"
                        type="text"
                        value={residentialAddress}
                      />
                    </div>

                    <div className="flex gap-2 flex-col">
                      <h2 className="text-gray-900 font-semibold text-sm">
                        Agent
                      </h2>
                      <Input
                        placeholder="Agent"
                        name="agent"
                        type="text"
                        value={agent}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-end lg:justify-end gap-6 mt-7 pb-2">
                    <button
                      onClick={handlePrev}
                      disabled={loader2}
                      className="bg-white border text-primary py-2 px-4 rounded-md shadow-md"
                    >
                      Previous
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DeletePlotDialog = ({
  plotId,
  open,
  onOpenChange,
  setDelDialogOpen,
  table,
  plotData,
  loading,
}) => {
  let databaseName;
  if (table && table === "nthc") {
    databaseName = "nthc";
  }
  if (table && table === "dar-es-salaam") {
    databaseName = "dar_es_salaam";
  }
  if (table && table === "trabuom") {
    databaseName = "trabuom";
  }
  if (table && table === "legon-hills") {
    databaseName = "legon_hills";
  }
  if (table && table === "yabi") {
    databaseName = "yabi";
  }

  const handleDeletePlot = async () => {
    console.log("Delete----->: ", plotId, "from database -> ", databaseName);
    const { data, error } = await supabase
      .from(databaseName)
      .delete()
      .eq("id", plotId);

    if (error) {
      toast.error("Something went wrong deleting plot");
    }
    sonarToast("Plot Deleted Successfully");
    setDelDialogOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {plotData && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete This Plot? </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              plot
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogDescription>
            <p>Plot Details</p>
            <p className="font-bold mt-2">
              {"Plot Number " +
                plotData.properties.Plot_No +
                " " +
                plotData.properties.Street_Nam}
            </p>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <Button type="button" onClick={() => setDelDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeletePlot}>Continue</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
};

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

const EditPlotDialog = ({
  open,
  onOpenChange,
  plotId,
  table,
  setIsDialogOpen,
}) => {
  const [plotData, setPlotData] = useState(plotInfo);
  const [allDetails, setAllDetails] = useState();
  const [plotDataLoading, setPlotDataLoading] = useState(false);

  const [loader1, setLoader1] = useState(false);
  const [loader2, setLoader2] = useState(false);
  const [step1, setStep1] = useState(true);
  const [step2, setStep2] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false)

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

  let databaseName;
  if (table && table === "nthc") {
    databaseName = "nthc";
  }
  if (table && table === "dar-es-salaam") {
    databaseName = "dar_es_salaam";
  }
  if (table && table === "trabuom") {
    databaseName = "trabuom";
  }
  if (table && table === "legon-hills") {
    databaseName = "legon_hills";
  }
  if (table && table === "yabi") {
    databaseName = "yabi";
  }

  useEffect(() => {
    if (plotId && databaseName) {
      setPlotDataLoading(true);
      const fetchPlot = async () => {
        try {
          const { data, error } = await supabase
            .from(databaseName)
            .select("*")
            .eq("id", plotId);
          if (error) {
            toast.error("Something went wrong");
            setPlotDataLoading(false);
            setIsDialogOpen(false);
            console.log(error);
            return;
          }
          if (data[0]) {
            setPlotDataLoading(false);
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
            console.log("Plot details unavailable");
            setPlotDataLoading(false);
          }
        } catch (error) {
          console.log(error);
          toast.error("Sorry try again later");
          setPlotDataLoading(false);
          setIsDialogOpen(false);
          return;
        }
      };

      fetchPlot();
    } else {
      toast.error("Sorry something went wrong");
      setIsDialogOpen(false);
      return;
    }
  }, [plotId, databaseName]);

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
      toast.error("Enter Residential Address");
      return;
    } else {
      setResAddressEr(false); //
    }

    //Update plot details with plotData on Supabase
    setLoader2(true);
    const { data, error } = await supabase
      .from(databaseName)
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
      .eq("id", plotId)
      .select("*");

    if (data) {
      sonarToast("Plot details updated successfully");
      setLoader2(false);
      console.log("updated successfully");
      setIsDialogOpen(false);

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    if (error) {
      console.log(error);
      toast.error("Sorry errror happened updating the plot details");
      setLoader2(false);
    }
  };

  const onInputChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setPlotData({ ...plotData, [name]: value });
    const selectedStatus = e.target.value;
    if(selectedStatus === 'Available'){
      setIsAvailable(true)
    }else{
      setIsAvailable(false)
    }
  };

  let amtRemaining = 0;
  const handleCalculateAmount = () => {
    amtRemaining = plotTotalAmount - paidAmount;
    setCalcAmount(amtRemaining);
    setPlotData({ ...plotData, remainingAmount: amtRemaining })
  };
  
  const handleInput = (event) => {
    const charCode = event.which ? event.which : event.keyCode;
    // Prevent input if the key is not a number (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  };
  
  const handleAvailableSubmit = async(e) => {
    e.preventDefault()
    //Update plot details with plotData on Supabase
    setLoader2(true);
    const { data, error } = await supabase
      .from(databaseName)
      .update({
        status: 'Available',
        firstname: '',
        lastname: '',
        email: '',
        country: '',
        phone: '',
        residentialAddress: '',
        agent: '',
        plotTotalAmount: plotData.plotTotalAmount,
        paidAmount: plotData.paidAmount,
        remainingAmount: plotData.remainingAmount,
        remarks: plotData.remarks,
      })
      .eq("id", plotId)
      .select();

    if (data) {
      toast.success("Plot  updated successfully");
      setLoader2(false);
      setTimeout(() => {
        window.location.reload();
      }, 1100);
    }
    if (error) {
      console.log(error);
      toast.error("Sorry errror happened updating the plot ");
      setLoader2(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw]">
        <DialogHeader>
          <DialogTitle className="font-bold">Edit Plot Details</DialogTitle>
        </DialogHeader>

        <div>
          {plotDataLoading && (
            <div className="flex flex-col justify-center items-center">
              <Loader className="animate-spin text-primary z-50" />
            </div>
          )}

          {allDetails && (
            <form onSubmit={handleFormSubmit}>
              {/* Step 1 */}

              {step1 && (
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
                        className="w-3/4"
                        value={
                          "Plot Number " +
                          allDetails?.properties?.Plot_No +
                          " " +
                          allDetails?.properties?.Street_Nam
                        }
                      />
                      <small className="text-red-800"></small>
                    </div>
                    <div className="flex gap-2 items-center">
                      <p className="text-gray-900 font-semibold text-sm w-1/4">
                        Plot Status
                      </p>
                      <Input
                        type="text"
                        disabled
                        className="w-3/4"
                        name="plotStatus"
                        value={plotStatus}
                      />
                      <small className="text-red-900"></small>
                    </div>
                    <div className="flex gap-2 items-center">
                      <h2 className="text-md font-semibold text-sm w-1/4">
                        Change Plot Status
                      </h2>
                      <div className="w-3/4">
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
                    </div>

                    <div className="flex gap-2 items-center">
                      <h2 className="text-gray-900 font-semibold w-1/4 text-sm">
                        Total Amount
                      </h2>
                      <div className="w-3/4">
                        <Input
                          placeholder="Plot Total Amount"
                          name="plotTotalAmount"
                          type="number"
                          onChange={onInputChange}
                          value={plotTotalAmount}
                          onKeyPress={handleInput}
                          onKeyUp={handleCalculateAmount}
                          style={{
                            border: plotTotalAmountEr && `1px solid red`,
                          }}
                        />
                        {plotTotalAmountEr && (
                          <small className="text-red-900">
                            Enter Plot amount
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <h2 className="text-gray-900 font-semibold text-sm w-1/4">
                        Paid Amount
                      </h2>
                      <div className="w-3/4">
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
                    </div>

                    <div className="flex gap-2 items-center">
                      <h2 className="text-gray-900 font-semibold text-sm w-1/4">
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
                        className="w-3/4"
                      />
                      <small className="text-red-800"></small>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h2 className="text-gray-900 font-semibold text-sm mb-2">
                      Remarks
                    </h2>
                    <Textarea
                      onChange={onInputChange}
                      name="remarks"
                      value={remarks}
                    />
                  </div>

                  {
                    isAvailable ? (
                      <div className="flex items-center justify-center md:justify-end lg:justify-end gap-6 mt-5 pb-6">
                        <button
                          onClick={handleAvailableSubmit}
                          className="bg-primary text-white py-2 px-4 rounded-md shadow-md"
                        >
                          {loader1 ? <Loader className="animate-spin" /> : "Submit"}
                        </button>
                      </div>
                    ): (
                      <div className="flex items-center justify-center md:justify-end lg:justify-end gap-6 mt-5 pb-6">
                        <button
                          onClick={handleStep1}
                          className="bg-primary text-white py-2 px-4 rounded-md shadow-md"
                        >
                          {loader1 ? <Loader className="animate-spin" /> : "Next"}
                        </button>
                      </div>
                    )
                  }
                </div>
              )}

              {/* Step2 */}

              {step2 && (
                <div className="pt-4">
                  <div className="flex flex-col space-y-4">
                    <div className=" flex items-center space-x-2">
                      <h2 className="text-gray-900 font-semibold text-sm w-1/4">
                        First Name:
                      </h2>
                      <Input
                        type="text"
                        placeholder="First Name"
                        name="firstname"
                        onChange={onInputChange}
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
                        onChange={onInputChange}
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
                        onChange={onInputChange}
                        value={email}
                        style={{ border: emailEr && `1px solid red` }}
                        className="w-3/4"
                      />
                      {emailEr && (
                        <small className="text-red-900">Enter your email</small>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-2">
                        <h2 className="text-gray-900 font-semibold text-sm w-1/4">
                          Country
                        </h2>
                        <select
                          onChange={onInputChange}
                          className="py-[9px] bg-white rounded-md text-dark border px-2 w-3/4"
                          name="country"
                          id="countryCode"
                          value={country}
                          style={{ border: countryEr && `1px solid red` }}
                        >
                          <option value="Select Country">
                            {" "}
                            Select Country
                          </option>
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
                          onChange={onInputChange}
                          value={phone}
                          onKeyPress={handleInput}
                          style={{ border: phoneEr && `1px solid red` }}
                          className="w-3/4"
                        />
                        {phoneEr && (
                          <small className="text-red-900">
                            Enter Phone Number
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-col">
                      <h2 className="text-gray-900 font-semibold text-sm">
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
                      <h2 className="text-gray-900 font-semibold text-sm">
                        Agent
                      </h2>
                      <Input
                        placeholder="Agent"
                        name="agent"
                        type="text"
                        onChange={onInputChange}
                        value={agent}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-end lg:justify-end gap-6 mt-7 pb-2">
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
                        "Save and Publish"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

