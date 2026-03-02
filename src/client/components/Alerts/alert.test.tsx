import { act, render, fireEvent, screen, within } from "@testing-library/react";
import { useAppStore } from "@client/services/store";
import Alert from ".";

describe("Validate Alerts", () => {

  it("Alerts slice validation", () => {
    expect(useAppStore.getState().alerts.newMessages.length).toBe(0);

    act(() => { useAppStore.getState().alerts.add("Alert one"); });
    expect(useAppStore.getState().alerts.newMessages).toStrictEqual([
      "Alert one",
    ]);

    act(() => { useAppStore.getState().alerts.add("Alert two"); });
    expect(useAppStore.getState().alerts.newMessages).toStrictEqual([
      "Alert one",
      "Alert two",
    ]);

    act(() => { useAppStore.getState().alerts.clear(); });
    expect(useAppStore.getState().alerts.newMessages.length).toBe(0);
  });

  it("Alerts component validation", () => {
    vi.useFakeTimers();

    const appState = useAppStore.getState();
    render(<Alert />);

    const alertsContainer = screen.getByRole("alerts-container");
    expect(alertsContainer).not.toBeNull();
    expect(alertsContainer).toBeEmptyDOMElement();

    act(() => { appState.alerts.add("An alert"); });
    expect(alertsContainer).not.toBeEmptyDOMElement();
    let alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).not.toBeNull();
    expect(alerts[0]).toHaveTextContent("An alert");

    act(() => { appState.alerts.add("Another alert"); });
    expect(alertsContainer).not.toBeEmptyDOMElement();
    alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(2);
    expect(alerts[1]).not.toBeNull();
    expect(alerts[1]).toHaveTextContent("Another alert");

    const closeButton = within(alerts[0]).getByRole("close");
    fireEvent.click(closeButton);
    alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).not.toBeNull();
    expect(alerts[0]).toHaveTextContent("Another alert");

    expect(alerts[0]).not.toHaveClass("fadeout");
    act(() => vi.advanceTimersToNextTimer());
    expect(alerts[0]).toHaveClass("fadeout");

    act(() => vi.advanceTimersToNextTimer());
    expect(alertsContainer).toBeEmptyDOMElement();

    vi.useRealTimers();
  });
});
