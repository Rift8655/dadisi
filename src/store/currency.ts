import { create } from "zustand";
import { persist } from "zustand/middleware";
import { exchangeRatesApi } from "@/lib/api-admin";

export type Currency = "KES" | "USD";

interface CurrencyState {
  currency: Currency;
  rate: number; // USD to KES rate (e.g., 145)
  isLoading: boolean;
  lastUpdated: string | null;
  setCurrency: (currency: Currency) => void;
  fetchRate: () => Promise<void>;
  convert: (amount: number, from: Currency, to: Currency) => number;
}

export const useCurrency = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: "KES",
      rate: 145, // Default/Fallback rate
      isLoading: false,
      lastUpdated: null,

      setCurrency: (currency: Currency) => set({ currency }),

      fetchRate: async () => {
        set({ isLoading: true });
        try {
          // Use the public endpoint
          const data = await exchangeRatesApi.getPublic();
          if (data && data.rate) {
            set({ 
              rate: typeof data.rate === 'string' ? parseFloat(data.rate) : data.rate,
              lastUpdated: data.last_updated,
              isLoading: false 
            });
          }
        } catch (error) {
          console.error("Failed to fetch exchange rate:", error);
          set({ isLoading: false });
        }
      },

      convert: (amount: number, from: Currency, to: Currency) => {
        if (from === to) return amount;
        const { rate } = get();
        if (from === "USD" && to === "KES") return amount * rate;
        if (from === "KES" && to === "USD") return amount / rate;
        return amount;
      },
    }),
    {
      name: "currency-storage",
      partialize: (state) => ({
        currency: state.currency,
        rate: state.rate,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
