import { render, act } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { useAppStore } from "@client/services/store";
import Spinner from "@client/components/Spinner";

describe("Validate Spinner component", () => {
  it("spinner.tsx validation", () => {

    const appState = useAppStore.getState();
    render(<Spinner />);

    // Be sure we are in expected state
    expect(appState.spinnerCount).toBe(0);

    // Spinner is not displayed
    const spinner = screen.queryByTestId("spinner");
    expect(spinner).toBeNull();

    // Display the spinner
    act(() => { appState.addSpinner(); });
    vi.waitFor(() => {
      const spinner = screen.queryByTestId("spinner");
      expect(spinner).not.toBeNull();
    });

    // Hide the spinner
    act(() => { appState.removeSpinner(); });
    vi.waitFor(() => {
      const spinner = screen.queryByTestId("spinner");
      expect(spinner).toBeNull();
    });

  });
});
