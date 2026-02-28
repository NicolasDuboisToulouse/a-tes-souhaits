import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface AppState {
  spinner: {
    count: number;
    add: () => void;
    remove: () => void;
  };
}

export const useAppStore = create<AppState>()(
  immer((set) => ({
    spinner: {
      count: 0,
      add: () => set((state: AppState) => { ++state.spinner.count; }),
      remove: () => set((state: AppState) => { state.spinner.count = Math.max(0, state.spinner.count - 1); }),
    },
  })),
);
