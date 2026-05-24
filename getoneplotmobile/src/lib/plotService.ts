import { supabase } from './supabase';
import type { BuyerInfo, PlotFeature } from '../types/plot';

export async function getPlotById(
  table: string,
  id: string
): Promise<PlotFeature | null> {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
  if (error || !data) return null;
  return data as PlotFeature;
}

export async function updatePlotOnHold(
  table: string,
  plotId: string,
  buyer: BuyerInfo
) {
  return supabase
    .from(table)
    .update({
      status: 'On Hold',
      firstname: buyer.firstname,
      lastname: buyer.lastname,
      email: buyer.email,
      phone: buyer.phone,
      country: buyer.country,
      residentialAddress: buyer.residentialAddress,
    })
    .eq('id', plotId);
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
  }
) {
  const { data: plotRows } = await supabase
    .from(plotTable)
    .select('*')
    .eq('id', plotId);
  const plot = plotRows?.[0];
  if (!plot) throw new Error('Plot not found');

  const { error } = await supabase.from(interestTable).insert([
    {
      plot_id: plotId,
      firstname: customer.firstname,
      lastname: customer.lastname,
      email: customer.email,
      phone: customer.phone,
      country: customer.country,
      message: customer.message,
      plot_details: plot,
    },
  ]);
  if (error) throw error;
}

export async function updatePlotPrice(
  table: string,
  plotId: string,
  price: number
) {
  return supabase.from(table).update({ plotTotalAmount: price }).eq('id', plotId);
}

export async function updatePlotStatusAdmin(
  table: string,
  plotId: string,
  status: string
) {
  return supabase.from(table).update({ status }).eq('id', plotId);
}

export function formatGhs(amount: number) {
  return `GHS ${amount.toLocaleString('en-GH')}`;
}
