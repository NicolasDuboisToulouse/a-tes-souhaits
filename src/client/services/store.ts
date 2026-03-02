import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import * as spinnerSlice from "@client/components/Spinner/slice";
import * as alertsSlice from "@client/components/Alerts/slice";

export type Set = (cb: (state: AppState) => void) => void;

export type AppState = {
  spinner: spinnerSlice.Type;
  alerts: alertsSlice.Type;
};

export const useAppStore = create<AppState>()(
  immer((set) => ({
    spinner: spinnerSlice.create(set),
    alerts: alertsSlice.create(set),
  })),
);
