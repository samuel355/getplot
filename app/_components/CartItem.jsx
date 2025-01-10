import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/store/useStore";
import { Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const CartItem = ({ plot }) => {
  const {removePlot} = useCart()
  const handleRemovePlot = () => {
    removePlot(plot.id)
    toast.success('Plot Removed successfully')
  }
  return (
    <Card key={plot.id}>
      <CardContent className="flex items-start gap-4 p-4">
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">
            {" "}
            Plot No. {plot.properties.Plot_No + " "}{" "}
            {plot.properties.Street_Nam}
          </p>
          <p className="font-semibold mt-1">
            GHS {plot.plotTotalAmount.toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col justify-between gap-8">
          <div className="flex items-center gap-4">
            <Button onClick={handleRemovePlot} variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItem;
