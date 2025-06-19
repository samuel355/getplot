"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { DataTable } from "../_components/DataTable";
import { columns } from "../_components/Columns";
import { insertFeatures } from "@/app/_actions/upload-plots-into-db";
import { yabiFeature } from "./yabi-feature";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Yabi() {
  const [plotData, setPlotData] = useState([]);
  const [loading, setLoading] = useState(false);
  const databaseName = "yabi";
  const insertCalled = useRef(false);

  useEffect(() => {
    fetchPlotData();
    // if(!insertCalled.current){
    //   insertFeatures(yabiFeature);
    //   insertCalled.current = true
    // }
  }, [yabiFeature]);

  const fetchPlotData = async () => {
    try {
      setLoading(true);
      // First batch (records 0 to 999)
      let { data, error } = await supabase.from("yabi").select(
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
        <h1 className="text-primary font-bold text-2xl">Yabi Plot</h1>
        <Link
          href={"/yabi"}
          className="text-primary text-base hover:underline flex items-center"
        >
          <span>See plots on maps span</span> <ArrowRight size={16} />
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
