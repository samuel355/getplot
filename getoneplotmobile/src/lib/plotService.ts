import { supabase } from "./supabase";
import type { BuyerInfo, PlotFeature } from "../types/plot";
import { normalizePlot } from "./mapUtils";

export type AdminPlotUpdate = {
  status: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  country?: string;
  phone?: string;
  residentialAddress?: string;
  agent?: string;
  plotTotalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  remarks?: string;
};

export async function getPlotById(table: string, id: string): Promise<PlotFeature | null> {
  const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
  if (error || !data) return null;
  return normalizePlot(data as Record<string, unknown>);
}

export async function updatePlotOnHold(table: string, plotId: string, buyer: BuyerInfo) {
  const res = await supabase
    .from(table)
    .update({
      status: "On Hold",
      firstname: buyer.firstname,
      lastname: buyer.lastname,
      email: buyer.email,
      phone: buyer.phone,
      country: buyer.country,
      residentialAddress: buyer.residentialAddress,
    })
    .eq("id", plotId);

  // Best-effort cache invalidation
  try {
    const apiURL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
    await fetch(`${apiURL}/api/cache/clear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: `property:detail:${plotId}`, usePattern: false }),
    });
    await fetch(`${apiURL}/api/cache/clear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "properties:list:*", usePattern: true }),
    });
  } catch (e) {
    console.warn("Failed to clear cache after updating plot on hold", e);
  }

  return res;
}

export async function submitPlotInterest(
  interestTable: string,
  plotTable: string,
  plotId: string,
  customer: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    country: string;
    message: string;
  },
) {
  const { data: plotRows } = await supabase.from(plotTable).select("*").eq("id", plotId);
  const plot = plotRows?.[0];
  if (!plot) throw new Error("Plot not found");

  const { error } = await supabase.from(interestTable).insert([
    {
      plotId: plotId, // Matching web app's 'plotId'
      firstname: customer.firstname,
      lastname: customer.lastname,
      email: customer.email,
      phone: customer.phone,
      country: customer.country,
      message: customer.message,
      plot_number: plot.properties?.Plot_No,
      plot_name: plot.properties?.Street_Nam,
      plot_amount: plot.plotTotalAmount,
      plot_details: plot, // Keeping full object for mobile app compatibility
    },
  ]);
  if (error) throw error;
}

export async function updatePlotPrice(table: string, plotId: string, price: number) {
  const { data: current, error: fetchError } = await supabase
    .from(table)
    .select("paidAmount")
    .eq("id", plotId)
    .single();

  if (fetchError) return { data: null, error: fetchError };

  const paidAmount = Number(current?.paidAmount ?? 0);
  return supabase
    .from(table)
    .update({
      plotTotalAmount: price,
      paidAmount,
      remainingAmount: price - paidAmount,
    })
    .eq("id", plotId)
    .select("*")
    .single();
}

export async function updatePlotStatusAdmin(table: string, plotId: string, status: string) {
  return supabase.from(table).update({ status }).eq("id", plotId).select("*").single();
}

export async function updatePlotDetailsAdmin(
  table: string,
  plotId: string,
  payload: AdminPlotUpdate,
) {
  return supabase.from(table).update(payload).eq("id", plotId).select("*").single();
}

export function formatGhs(amount: number) {
  return `GHS ${amount.toLocaleString("en-GH")}`;
}

export function formatAreaSize(size: unknown): string {
  if (size === undefined || size === null || size === "") return "Unknown size";
  const num = Number(size);
  if (Number.isNaN(num) || num <= 0) return "Unknown size";
  return `${num.toFixed(2)} acres`;
}

export function formatStreet(street: unknown): string {
  if (!street) return "";
  return String(street).replace(/\r/g, "").trim();
}
