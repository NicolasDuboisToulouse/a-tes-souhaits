import { Set } from "@client/services/store";
import { User } from "@client/protocol";

export type Type = {
  info: User | undefined;
  set: (info: User | undefined) => void;
};

export function create(storeSet: Set): Type {
  return {
    info: undefined,
    set: (info: User | undefined) => storeSet((state) => {
      state.user.info = info;
    }),
  };
}
