import { Set } from "@client/services/store";

export type Type = {
  newMessages: string[];
  add: (message: string) => void;
  clear: () => void;
};

export function create(set: Set): Type {
  return {
    newMessages: [],

    add: (message: string) => set((state) => {
      state.alerts.newMessages.push(message);
    }),

    clear: () => set((state) => {
      state.alerts.newMessages = [];
    }),
  };
}
