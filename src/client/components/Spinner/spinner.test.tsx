import { render, act, screen } from "@testing-library/react";
import { useAppStore } from "@client/services/store";
import Spinner from "@client/components/Spinner";

describe("Validate Spinner component", () => {
  it("Spinner slice validation", () => {
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

  it("Spinner validation", async() => {

    const appState = useAppStore.getState();
    render(<Spinner />);

    // Be sure we are in expected state
    expect(appState.spinner.count).toBe(0);

    // Spinner is not displayed
    expect(screen.queryByRole("spinner")).not.toBeInTheDocument();

    // Display the spinner
    act(() => { appState.spinner.add(); });
    expect(await screen.findByRole("spinner")).toBeInTheDocument();

    // Hide the spinner
    act(() => { appState.spinner.remove(); });
    await vi.waitFor(() => {
      const spinner = screen.queryByRole("spinner");
      expect(spinner).toBeNull();
    });

  });
});
