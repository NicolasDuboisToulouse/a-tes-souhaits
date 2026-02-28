import { act } from "@testing-library/react";
import { useAppStore } from "@client/services/store";

describe("Application store", () => {
  it("store.ts validation", () => {
    expect(useAppStore.getState().spinner.count).toBe(0);

    act(() => { useAppStore.getState().spinner.add(); });
    expect(useAppStore.getState().spinner.count).toBe(1);

    act(() => { useAppStore.getState().spinner.add(); });
    expect(useAppStore.getState().spinner.count).toBe(2);

    act(() => { useAppStore.getState().spinner.remove(); });
    expect(useAppStore.getState().spinner.count).toBe(1);

    act(() => { useAppStore.getState().spinner.remove(); });
    expect(useAppStore.getState().spinner.count).toBe(0);

    act(() => { useAppStore.getState().spinner.remove(); });
    expect(useAppStore.getState().spinner.count).toBe(0);
  });
});
