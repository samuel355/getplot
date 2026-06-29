"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { DataTable } from "../_components/DataTable";
import { columns } from "../_components/Columns";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "react-toastify";

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
      const batchSize = 985; // Adjust as needed
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
          `
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Trabuom Sector 1</h1>
          <p className="text-sm text-slate-400 mt-0.5">{plotData.length.toLocaleString()} plots loaded</p>
        </div>
        <Link
          href={"/sites/trabuom-sector-1"}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          View on map <ArrowRight size={14} />
        </Link>
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
