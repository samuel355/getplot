import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { PlotFeature } from '../types/plot';

export type CartPlot = PlotFeature & { quantity: number };

type CartState = {
  plots: CartPlot[];
  addPlot: (item: PlotFeature, quantity?: number) => void;
  removePlot: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  getTotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      plots: [],
      addPlot: (item, quantity = 1) => {
        set((state) => {
          const existing = state.plots.find((p) => p.id === item.id);
          if (existing) {
            return {
              plots: state.plots.map((p) =>
                p.id === item.id ? { ...p, quantity: p.quantity + quantity } : p
              ),
            };
          }
          return { plots: [...state.plots, { ...item, quantity }] };
        });
      },
      removePlot: (id) =>
        set((state) => ({ plots: state.plots.filter((p) => p.id !== id) })),
      clearCart: () => set({ plots: [] }),
      isInCart: (id) => get().plots.some((p) => p.id === id),
      getTotal: () =>
        get().plots.reduce(
          (t, p) => t + (p.plotTotalAmount || 0) * p.quantity,
          0
        ),
    }),
    {
      name: 'getoneplot-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
