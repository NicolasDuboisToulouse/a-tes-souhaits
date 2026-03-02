import { Set } from "@client/services/store";

export type Type = {
  count: number;
  add: () => void;
  remove: () => void;
};

export function create(set: Set): Type {
  return {
    count: 0,
    add: () => set((state) => { ++state.spinner.count; }),
    remove: () => set((state) => { state.spinner.count = Math.max(0, state.spinner.count - 1); }),
  };
}
