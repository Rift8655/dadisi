import { create } from "zustand";
import { persist } from "zustand/middleware";
import { exchangeRatesApi } from "@/lib/api-admin";

export type Currency = "KES" | "USD";

interface CurrencyState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convert: (amount: number, from: Currency, to: Currency, rate: number) => number;
}

export const useCurrency = create<CurrencyState>()(
  persist(
    (set, _get) => ({
      currency: "KES",

      setCurrency: (currency: Currency) => set({ currency }),

      convert: (amount: number, from: Currency, to: Currency, rate: number) => {
        if (from === to) return amount;
        if (from === "USD" && to === "KES") return amount * rate;
        if (from === "KES" && to === "USD") return amount / rate;
        return amount;
      },
    }),
    {
      name: "currency-storage",
      partialize: (state) => ({
        currency: state.currency,
      }),
    }
  )
);

