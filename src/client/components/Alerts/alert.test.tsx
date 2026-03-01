import { act, render } from "@testing-library/react";
import { fireEvent, screen } from "@testing-library/dom";
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

    const alerts = screen.queryByTestId("alerts-container");
    expect(alerts).not.toBeNull();
    expect(alerts).toBeEmptyDOMElement();

    act(() => { appState.alerts.add("An alert"); });
    expect(alerts).not.toBeEmptyDOMElement();
    let alert0 = screen.queryByTestId("alert-0");
    expect(alert0).not.toBeNull();
    expect(alert0).toHaveTextContent("An alert");

    act(() => { appState.alerts.add("Another alert"); });
    expect(alerts).not.toBeEmptyDOMElement();
    const alert1 = screen.queryByTestId("alert-1");
    expect(alert1).not.toBeNull();
    expect(alert1).toHaveTextContent("Another alert");

    const closeButton = alert0?.getElementsByTagName("button")[0];
    act(() => { fireEvent.click(closeButton!); });
    alert0 = screen.queryByTestId("alert-0");
    expect(alert0).toBeNull();

    expect(alert1?.className).not.contains("fadeout");
    act(() => vi.advanceTimersToNextTimer());
    expect(alert1?.className).contains("fadeout");

    act(() => vi.advanceTimersToNextTimer());
    expect(alerts).toBeEmptyDOMElement();

    vi.useRealTimers();
  });
});
