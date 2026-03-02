import { Set } from "@client/services/store";
import { User } from "@client/protocol";

export type Type = {
  info: User | undefined;
  set: (info: User) => void;
};

export function create(storeSet: Set): Type {
  return {
    info: undefined,
    set: (info: User) => storeSet((state) => {
      state.user.info = info;
    }),
  };
}
