import { act } from "@testing-library/react";
import { useAppStore } from "@client/services/store";

describe("Application store", () => {
  it("store.ts validation", () => {
    expect(useAppStore.getState().spinnerCount).toBe(0);

    act(() => { useAppStore.getState().addSpinner(); });
    expect(useAppStore.getState().spinnerCount).toBe(1);

    act(() => { useAppStore.getState().addSpinner(); });
    expect(useAppStore.getState().spinnerCount).toBe(2);

    act(() => { useAppStore.getState().removeSpinner(); });
    expect(useAppStore.getState().spinnerCount).toBe(1);

    act(() => { useAppStore.getState().removeSpinner(); });
    expect(useAppStore.getState().spinnerCount).toBe(0);

    act(() => { useAppStore.getState().removeSpinner(); });
    expect(useAppStore.getState().spinnerCount).toBe(0);
  });
});
