"use client";

import { useEffect, useState } from "react";
import { columns } from "./_components/Columns";
import { DataTable } from "./_components/DataTable";
import { data } from "./data";
import { supabase } from "@/utils/supabase/client";

export default function Dashboard() {

  return (
    <div className="">
      <h1 className="text-primary font-bold text-2xl">Dashboard</h1>
    </div>
  );
}
