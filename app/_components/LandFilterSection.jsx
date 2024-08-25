import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bath, BedDouble, CarFront } from "lucide-react";

const LandFilterSection = () => {
  return (
    <div className="p-1 flex flex-wrap gap-2 items-center">
      <Select onValueChange={""} name="price">
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Price Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          <SelectItem value="0-20000">GHS.(0-20,000)</SelectItem>
          <SelectItem value="20000-50000">GHS.(20,000-50,000)</SelectItem>
          <SelectItem value="50000-100000">GHS.(50,000-100,000)</SelectItem>
          <SelectItem value="100000-500000">GHS.(100,000-500,000)</SelectItem>
          <SelectItem value="50000+">GHS.(500,000+)</SelectItem>
        </SelectContent>
      </Select>

      <Select
        name="landType"
        // onValueChange={(value) =>
        //   value === "All" ? setHomeType(null) : setHomeType(value)
        // }
        onValueChange={""}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Land Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          <SelectItem value="Completed">Serviced</SelectItem>
          <SelectItem value="Uncompleted">Unserviced</SelectItem>
          <SelectItem value="Partially Serviced">Partially Serviced</SelectItem>
          <SelectItem value="Beach Land">Beach Land</SelectItem>
          <SelectItem value="Farm Land">Farm Land</SelectItem>
          <SelectItem value="Residential Land">Residential Land</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LandFilterSection;
