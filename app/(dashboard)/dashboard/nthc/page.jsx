"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { DataTable } from "../_components/DataTable";
import { columns } from "../_components/Columns";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NTHC() {
  const [plotData, setPlotData] = useState([]);
  const [loading, setLoading] = useState(false);
  const databaseName = "nthc";
  useEffect(() => {
    fetchPlotData();
  }, []);

  const fetchPlotData = async () => {
    try {
      setLoading(true);
      // First batch (records 0 to 999)
      let { data, error } = await supabase.from("nthc").select(
        `
      id, 
      properties->>Plot_No,
      properties->>Street_Nam,
      status,
      firstname,
      lastname,
      email,
      phone,
      plotTotalAmount,
      paidAmount,
      remainingAmount
    `
      );

      if (error) {
        toast.error("Sorry something happened displaying the plots");
        setLoading(false);
        console.log(error);
        return;
      }
      if (data && data.length > 0) {
        setPlotData(data);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error("Sorry something happened displaying the plots");
    }
  };

  return (
    <div className="">
      <div className="-mt-5 flex items-center justify-between">
        <h1 className="text-primary font-bold text-2xl">NTHC Plot</h1>
        <Link
          href={"/nthc"}
          className="text-primary text-base hover:underline flex items-center"
        >
          <span>See plots on maps span</span> <ArrowRight size={16} />{" "}
        </Link>
      </div>
      <DataTable
        loading={loading}
        databaseName={databaseName}
        data={plotData}
        columns={columns}
      />
    </div>
  );
}
