/** Land status palette — aligned with getoneplot.com map legend & web Map.jsx */
export const PLOT_STATUS = {
  available: {
    label: 'Available',
    fill: 'rgba(22, 101, 52, 0.35)',
    stroke: '#166534',
    legend: '#166534',
  },
  reserved: {
    label: 'Reserved',
    fill: 'rgba(23, 23, 23, 0.45)',
    stroke: '#171717',
    legend: '#171717',
  },
  sold: {
    label: 'Sold',
    fill: 'rgba(220, 38, 38, 0.4)',
    stroke: '#dc2626',
    legend: '#dc2626',
  },
  onHold: {
    label: 'On Hold',
    fill: 'rgba(107, 114, 128, 0.45)',
    stroke: '#6b7280',
    legend: '#6b7280',
  },
  unpriced: {
    label: 'Unpriced',
    fill: 'rgba(30, 58, 138, 0.4)',
    stroke: '#1e3a8a',
    legend: '#1e3a8a',
  },
} as const;

export type PlotStatusKey = keyof typeof PLOT_STATUS;

export const PLOT_LEGEND_ITEMS = [
  PLOT_STATUS.available,
  PLOT_STATUS.reserved,
  PLOT_STATUS.sold,
  PLOT_STATUS.onHold,
  PLOT_STATUS.unpriced,
] as const;
