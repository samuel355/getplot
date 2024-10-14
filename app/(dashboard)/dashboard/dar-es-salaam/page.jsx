"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { DataTable } from "../_components/DataTable";
import { columns } from "../_components/Columns";

export default function DarEsSalaam() {
  const [plotData, setPlotData] = useState([]);
  const [loading, setLoading] = useState(false);
  const databaseName = 'dar_es_salaam'
  useEffect(() => {
    fetchPlotData();
  }, []);

  const fetchPlotData = async (bounds) => {
    let allRecords;
    setLoading(true);
    // First batch (records 0 to 999)
    let { data: records1, error1 } = await supabase
      .from("dar_es_salaam")
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
      .range(0, 999);

    if (error1) {
      console.log(error1);
      return;
    }

    if (records1 || records1 !== null) {
      allRecords = records1;
      setPlotData(allRecords);
      // Second batch (records 1000 to 1999)
      let { data: records2, error2 } = await supabase.from("dar_es_salaam").select(`
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
      `);

      if (error2) {
        console.log(error2);
        return;
      }
      if (records2 || records2 !== null) {
        allRecords = [...allRecords, ...records2];
        setPlotData(allRecords);
        // Third batch (records 2000 to 2999)
        let { data: records3, error3 } = await supabase
          .from("dar_es_salaam")
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
          .range(2000, 2999);

        if (error3) {
          console.log(error3);
          return;
        }
        if (records3 || records3 !== null) {
          allRecords = [...allRecords, ...records3];
          setPlotData(allRecords);

          // Fourth batch (records 3000 to 3279)
          let { data: records4, error4 } = await supabase
            .from("dar_es_salaam")
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
            .range(3000, 3279);

          if (error4) {
            console.log(error4);
            return;
          }
          if (records4 || records4 !== null) {
            allRecords = [...allRecords, ...records4];
            setPlotData(allRecords);
          }
        }
      }
    }
  };

  return (
    <div>
      <div className="fixed top-0 pt-10 z-30 pb-2 w-full bg-white">
        <h1 className="text-primary font-bold text-2xl">Dar Es Salaam Plot Data</h1>
      </div>
      <div className="mt-14">
        <DataTable databaseName={databaseName} data={plotData} columns={columns} />
      </div>
    </div>
  );
}
