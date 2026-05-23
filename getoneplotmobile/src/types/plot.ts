export type PlotProperties = {
  Plot_No?: string;
  Street_Nam?: string;
  Area?: string | number;
  [key: string]: unknown;
};

export type PlotFeature = {
  id: string;
  type?: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  properties: PlotProperties;
  plotTotalAmount?: number;
  status?: string | null;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  country?: string;
  residentialAddress?: string;
};

export type BuyerInfo = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  country: string;
  residentialAddress: string;
  agent?: string;
  plotTotalAmount: number;
  paidAmount?: number;
  remainingAmount?: number;
  remarks?: string;
};
