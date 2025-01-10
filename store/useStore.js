import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCart = create(
  persist(
    (set, get) => ({
      plots: [],

      addPlot: (item, quantity = 1) => {
        set((state) => {
          const existingPlot = state.plots.find((plot) => plot.id === item.id);
          if (existingPlot) {
            return {
              ...state,
              plots: state.plots.map((plot) =>
                plot.id === item.id
                  ? { ...plot, quantity: plot.quantity + quantity }
                  : plot
              ),
            };
          }
          return {
            ...state,
            plots: [...state.plots, { ...item, quantity }],
          };
        });
      },

      removePlot: (id) =>
        set((state) => ({
          ...state,
          plots: state.plots.filter((plot) => plot.id !== id),
        })),

      clearCart: () => set((state) => ({ ...state, plots: [] })),

      isInCart: (id) => {
        const { plots } = get();
        return plots.some((plot) => plot.id === id);
      },

      getTotal: () => {
        const { plots } = get();
        return plots.reduce(
          (total, item) => total + item.plotTotalAmount * item.quantity,
          0,
        );
      },
    }),

    { name: "plots" }
  )
);
