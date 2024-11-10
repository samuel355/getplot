import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast as tToast } from "sonner";
import { parseISO, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Loader, MoreHorizontal } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const clientsColumns = [
  {
    accessorKey: "firstname",
    header: () => <div className="">First Name</div>,
  },
  {
    accessorKey: "lastname",
    header: () => <div className="">Last Name</div>,
  },
  {
    accessorKey: "email",
    cell: (info) => info.getValue(),
    header: ({ column }) => (
      <Button
        className="flex justify-start p-1"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-1 h-4" />
      </Button>
    ),
  },
  {
    accessorKey: "phone",
    header: () => <div className="">Contact</div>,
  },
  {
    accessorKey: "plot_number",
    header: () => <div className="">Plot No. </div>,
  },
  {
    accessorKey: "plot_name",
    header: () => <div className="">Street</div>,
  },
  {
    accessorKey: "created_at",
    header: () => <div className="">Data</div>,
    cell: ({ row }) => {
      const dbDate = row.getValue("created_at");
      const formatDate = format(parseISO(dbDate), "yyyy-MM-dd HH:mm:ss");
      return <div>{formatDate}</div>;
    },
  },
  {
    id: "actions",
    header: () => {
      const { user } = useUser();
      if (user.publicMetadata.role === "sysadmin") {
        return <div className="text-right">Action</div>;
      }
    },
    cell: ({ row }) => {
      const { user } = useUser();
      const rowData = row.original;
      const id = rowData.id;
      const [dialogOpen, setDialogOpen] = useState(false);
      const [deleteDialog, setDeleteDialog] = useState(false);
      const [loading, setLoading] = useState(false);
      const [clientData, setClientData] = useState({});
      const pathname = usePathname();

      let databaseName = "";
      if (pathname.includes("trabuom-interested-clients"))
        databaseName = "trabuom_interests";
      else if (pathname.includes("kwadaso-interested-clients"))
        databaseName = "nthc_interests";
      else if (pathname.includes("legon-hills-interested-clients"))
        databaseName = "legon_hills_interests";
      else if (pathname.includes("adense-interested-clients"))
        databaseName = "dar_es_salaam_interests";

      const handleDeleteDialog = async (event) => {
        event.preventDefault();
        if (id !== null) {
          setDeleteDialog(true);
          setLoading(true);
          try {
            const { data, error } = await supabase
              .from(databaseName)
              .select("*")
              .eq("id", id);
            if (error) {
              console.log(error);
              toast.error("sorry, something went wrong, try again later");
              setLoading(false);
              return;
            }
            setClientData(data[0]);
            setLoading(false);
          } catch (error) {
            console.log(error);
            toast.error("Sorry something went wrong, try again later");
            setLoading(true);
            setDeleteDialog(false);
            return;
          }
        } else {
          toast.error("Something went wrong. Try again later");
          setLoading(false);
          setDeleteDialog(false);
        }
      };

      return (
        <>
          <div className="flex justify-end">
            {user.publicMetadata.role === "sysadmin" && (
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
                    <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeleteDialog}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <ViewDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              setDialogOpen={setDialogOpen}
              id={id}
              databaseName={databaseName}
            />

            <DeleteDialog
              open={deleteDialog}
              onOpenChange={setDeleteDialog}
              setDeleteDialog={setDeleteDialog}
              loading={loading}
              databaseName={databaseName}
              id={id}
              clientData={clientData}
            />
          </div>
        </>
      );
    },
  },
];

const DeleteDialog = ({
  open,
  onOpenChange,
  setDeleteDialog,
  loading,
  databaseName,
  id,
  clientData,
}) => {
  
  const handleDelete = async () => {
    const { data, error } = await supabase
      .from(databaseName)
      .delete()
      .eq("id", id)
    if(error){
      toast.error('Sorry something went wrong');
      console.log(error)
      setDeleteDialog(false)
    }
    setDeleteDialog(false)
    tToast('Details deleted successfully')
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        {clientData && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete This client info ? </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                Details
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogDescription>
              <p>Client Name</p>
              <p className="font-bold mt-2">
                {" " + clientData.firstname + " " + clientData.lastname}
              </p>
            </AlertDialogDescription>
            <AlertDialogFooter>
              <Button type="button" onClick={() => setDeleteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleDelete}>Continue</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </>
  );
};

const ViewDialog = ({
  open,
  onOpenChange,
  setDialogOpen,
  id,
  databaseName,
}) => {
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id && databaseName) {
      setLoading(true);
      const fetchDetails = async () => {
        const { data, error } = await supabase
          .from(databaseName)
          .select(`*`)
          .eq("id", id);

        if (error) {
          setLoading(false);
          console.log(error);
          toast.error("Try again later");
        }
        setLoading(false);
        setDetails(data[0]);
      };

      fetchDetails();
    } else {
      setLoading(false);
      toast.error("Something went wrong");
      setDialogOpen(false);
    }
  }, [id, databaseName]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-90vw">
        <DialogHeader>
          <DialogTitle className="font-bold">Client Details</DialogTitle>
        </DialogHeader>
        <div>
          {loading && (
            <div className="flex p-8 items-center flex-col justify-center">
              <span>Loading...</span>
            </div>
          )}

          {details && (
            <form>
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
                        details?.plot_number +
                        " " +
                        details?.plot_name
                      }
                    />
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
                      value={details?.firstname}
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
                      placeholder="Last Name(s)"
                      value={details?.lastname}
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
                      value={details?.email}
                      className="w-3/4"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <h2 className="text-gray-900 font-semibold text-sm w-1/4">
                      Phone
                    </h2>
                    <Input
                      placeholder="Email Address"
                      name="email"
                      type="email"
                      value={details?.country + details?.phone}
                      className="w-3/4"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h2 className="text-gray-900 font-semibold text-sm mb-2">
                    Message
                  </h2>
                  <Textarea name="message" value={details?.message} />
                </div>

                <div className="flex items-center justify-between mt-7 pb-2">
                  {/* <p> Sent at {format(parseISO(details?.created_at), "yyyy-MM-dd HH:mm:ss") }</p> */}
                  <p> Sent at: {details.created_at}</p>
                  <button
                    onClick={() => setDialogOpen(false)}
                    type="button"
                    className="bg-primary text-white py-2 px-4 rounded-md shadow-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
