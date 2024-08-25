import { Button } from "@/components/ui/button";
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

const PlotInfoWindow = ({ text1, text2, path, id }) => {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg">
      <div className="px-6 py-4 flex flex-col">
        <div className="font-bold md:text-lg lg:text-lg text-sm mb-2">
          Plot Number {text1}, {text2}
        </div>
        <hr />
        <a
          href={`${path}/buy-plot/${id}`}
          className="border px-4 py-1 mt-3 rounded-md text-sm font-normal"
        >
          Buy Plot
        </a>
        <a
          href={`${path}/reserve-plot/${id}`}
          id="reserve_plot_button"
          className="border px-4 py-1 my-2 rounded-md text-sm font-normal"
        >
          Reserve Plot
        </a>
        <a
          href={`${path}/edit-plot/${id}`}
          id="reserve_plot_button"
          className="border px-4 py-1 mb-2 rounded-md text-sm font-normal"
        >
          Edit Plot
        </a>
        <a
          href="tel:0322008282"
          className="border px-4 py-1 rounded-md text-sm font-normal"
        >
          Call For Info
        </a>

        <button>Change Plot Price</button>
      </div>
    </div>
  );
};

export default PlotInfoWindow;
