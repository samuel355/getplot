import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";

const ChangePriceDialog = ({ modalOpen, setModalOpen, onClose, hanldeSaveNewPrice, loading, newPriceEr, handleInput }) => (
  <form>
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Plot Price</DialogTitle>
          <DialogDescription className="flex items-center gap-4 text-gray-800 text-sm">
            <span className="font-semibold text-sm">Plot Details: </span>
            <p className=" text-sm" id="description"></p>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4 font-medium">
            <Label htmlFor="name" className="text-right">
              Old Price:
            </Label>
            <p id="old-price" className="text-base text-gray-800"></p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newprice" className="text-right">
              New Price (GHS.)
            </Label>
            <Input
              className="col-span-3"
              type="number"
              id="newPrice"
              style={{ border: newPriceEr && "1px solid red" }}
              onKeyPress={handleInput}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={hanldeSaveNewPrice} type="button">
            {loading ? (
              <Loader className="animate-spin" />
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </form>
);

export default ChangePriceDialog; 