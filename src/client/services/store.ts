import { create } from "zustand";

interface AppState {
  spinnerCount: number;
  addSpinner: () => void;
  removeSpinner: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  spinnerCount: 0,
  addSpinner: () => set((state) => ({ spinnerCount: state.spinnerCount + 1 })),
  removeSpinner: () => set((state) => ({ spinnerCount: Math.min(state.spinnerCount - 1, 0) })),
}));
