import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bath, BedDouble, CarFront } from "lucide-react";

const FilterSesction = ({
  setBedCount,
  setBathCount,
  setParkingCount,
  setHomeType,
}) => {
  return (
    <div className="p-1 flex flex-wrap gap-2 items-center">
      <Select onValueChange={setBedCount}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Beds" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="2">
            <h2 className="flex gap-2">
              {" "}
              <BedDouble className="h-5 w-5 text-primary" /> 2+
            </h2>
          </SelectItem>
          <SelectItem value="3">
            <h2 className="flex gap-2">
              {" "}
              <BedDouble className="h-5 w-5 text-primary" /> 3+
            </h2>
          </SelectItem>
          <SelectItem value="4">
            <h2 className="flex gap-2">
              {" "}
              <BedDouble className="h-5 w-5 text-primary" /> 4+
            </h2>
          </SelectItem>
          <SelectItem value="5">
            <h2 className="flex gap-2">
              {" "}
              <BedDouble className="h-5 w-5 text-primary" /> 5+
            </h2>
          </SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={setBathCount}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Baths" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="2">
            <h2 className="flex gap-2">
              {" "}
              <Bath className="h-5 w-5 text-primary" /> 2+
            </h2>
          </SelectItem>
          <SelectItem value="3">
            <h2 className="flex gap-2">
              {" "}
              <Bath className="h-5 w-5 text-primary" /> 3+
            </h2>
          </SelectItem>
          <SelectItem value="4">
            <h2 className="flex gap-2">
              {" "}
              <Bath className="h-5 w-5 text-primary" /> 4+
            </h2>
          </SelectItem>
          <SelectItem value="5">
            <h2 className="flex gap-2">
              {" "}
              <Bath className="h-5 w-5 text-primary" /> 5+
            </h2>
          </SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={setParkingCount}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Parking" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="2">
            <h2 className="flex gap-2">
              {" "}
              <CarFront className="h-5 w-5 text-primary" /> 2+
            </h2>
          </SelectItem>
          <SelectItem value="3">
            <h2 className="flex gap-2">
              {" "}
              <CarFront className="h-5 w-5 text-primary" /> 3+
            </h2>
          </SelectItem>
          <SelectItem value="4">
            <h2 className="flex gap-2">
              {" "}
              <CarFront className="h-5 w-5 text-primary" /> 4+
            </h2>
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        // onValueChange={(value) =>
        //   value === "All" ? setHomeType(null) : setHomeType(value)
        // }
        onValueChange={setHomeType}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Home Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="Uncompleted">Uncompleted</SelectItem>
          <SelectItem value="Semi Completed">Semi Completed</SelectItem>
          <SelectItem value="Apartment">Apartment</SelectItem>
          <SelectItem value="Self Contained">Self Contained</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterSesction;
