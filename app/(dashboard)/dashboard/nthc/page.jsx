"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { DataTable } from "../_components/DataTable";
import { columns } from "../_components/Columns";

export default function NTHC() {
  const [plotData, setPlotData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [plotInfo, setPlotInfo] = useState([]);
  const databaseName = "nthc";
  useEffect(() => {
    // async function testPlotInfo() {
    //   const { data, error } = await supabase
    //     .from("trabuom")
    //     .select(`properties->>Plot_No, properties->>Street_Nam`)
    //     .eq("properties->>Street_Nam", "AKUA AFRIYIE STREET").eq("properties->>Plot_No", "3")
    //   if (data) {
    //     setPlotInfo(data);
    //   }
    //   if (error) {
    //     console.log(error);
    //   }
    // }

    // testPlotInfo();
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
      <div className="-mt-5">
        <h1 className="text-primary font-bold text-2xl">NTHC Plot</h1>
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
