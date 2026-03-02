import { render, screen, within } from "@testing-library/react";
import RouteError from ".";

const mockData = vi.hoisted((): { error: unknown } => {
  return {
    error: undefined,
  };
});

vi.mock("react-router", async(importOriginal) => {
  const actual: unknown[] = await importOriginal();
  return {
    ...actual,
    useRouteError() {
      return mockData.error;
    },
  };
});

describe("Validate RouteError component", () => {
  it("RouteError with ErrorResponse", async() => {
    mockData.error = { status: 23, statusText: "Error", data: "data", internal: false };
    render(<RouteError />);
    const routeErrorDom = screen.getByRole("RouteError");
    expect(routeErrorDom).toBeInTheDocument();
    expect(within(routeErrorDom).getByRole("MainText")).toBeInTheDocument();
    expect(within(routeErrorDom).getByRole("SecondaryText")).toBeInTheDocument();
    expect(within(routeErrorDom).queryByRole("ErrorStack")).not.toBeInTheDocument();
  });
  it("RouteError with Error", async() => {
    mockData.error = new Error("an Error");
    render(<RouteError />);
    const routeErrorDom = screen.getByRole("RouteError");
    expect(routeErrorDom).toBeInTheDocument();
    expect(within(routeErrorDom).getByRole("MainText")).toBeInTheDocument();
    expect(within(routeErrorDom).getByRole("SecondaryText")).toBeInTheDocument();
    expect(within(routeErrorDom).getByRole("ErrorStack")).toBeInTheDocument();
  });

  it("RouteError with Unknown", async() => {
    mockData.error = "an error";
    render(<RouteError />);
    const routeErrorDom = screen.getByRole("RouteError");
    expect(routeErrorDom).toBeInTheDocument();
    expect(within(routeErrorDom).queryByRole("MainText")).not.toBeInTheDocument();
    expect(within(routeErrorDom).queryByRole("SecondaryText")).not.toBeInTheDocument();
    expect(within(routeErrorDom).queryByRole("ErrorStack")).not.toBeInTheDocument();
  });
});
