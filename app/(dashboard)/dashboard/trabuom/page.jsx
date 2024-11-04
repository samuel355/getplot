"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { DataTable } from "../_components/DataTable";
import { columns } from "../_components/Columns";

export default function Trabuom() {
  const [plotData, setPlotData] = useState([]);
  const [loading, setLoading] = useState(false);
  const databaseName = "trabuom";

  useEffect(() => {
    fetchPlotData();
  }, []);

  const fetchPlotData = async () => {
    setLoading(true);
    try {
      // Fetch data in batches
      const batchSize = 950; // Adjust as needed
      let allRecords = [];
      let startIndex = 0;
      let hasMoreData = true;

      while (hasMoreData) {
        const { data: records, error } = await supabase
          .from("trabuom")
          .select(
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
          `,
          )
          .range(startIndex, startIndex + batchSize - 1);

        if (error) {
          console.log(error);
          setLoading(false);
          toast.error("Error fetching plot data.");
          return;
        }

        if (records && records.length > 0) {
          allRecords = [...allRecords, ...records];
          startIndex += batchSize;
        } else {
          hasMoreData = false;
        }
      }

      setPlotData(allRecords);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Error fetching plot data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="-mt-5">
        <h1 className="text-primary font-bold text-2xl">Trabuom Plot</h1>
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
