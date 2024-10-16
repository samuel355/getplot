"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "react-toastify";
import { DataTable } from "../_components/DataTable";
import { columns } from "../_components/columns";

export default function DarEsSalaam() {
  const [plotData, setPlotData] = useState([]);
  const [loading, setLoading] = useState(false);
  const databaseName = "dar_es_salaam";
  useEffect(() => {
    fetchPlotData();
  }, []);

  const fetchPlotData = async () => {
    try {
      setLoading(true);
      // First batch (records 0 to 999)
      let { data, error } = await supabase.from("dar_es_salaam").select(
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
    <div>
      <div className="-mt-5">
        <h1 className="text-primary font-bold text-2xl">Dar Es Salaam Plot</h1>
      </div>
      <div className="mt-2">
        <DataTable
          loading={loading}
          databaseName={databaseName}
          data={plotData}
          columns={columns}
        />
      </div>
    </div>
  );
}
