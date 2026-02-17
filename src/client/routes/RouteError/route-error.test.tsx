import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";

beforeAll(async() => {
  vi.doMock("react-router", async(importOriginal) => {
    const actual: unknown[] = await importOriginal();
    return {
      ...actual,
      useRouteError() { return global.testData; },
    };
  });
  global.testComponent = (await import(".")).default;
});

afterAll(() => {
  vi.doUnmock("react-router");
});

describe("Validate RouteError component", () => {
  it("RouteError with ErrorResponse", async() => {
    global.testData = { status: 23, statusText: "Error", data: "data", internal: false };
    render(<global.testComponent />);
    const routeErrorDom = screen.queryByTestId("routeRouteError");
    expect(routeErrorDom).toBeInTheDocument();
  });

  it("RouteError with Error", async() => {
    global.testData = new Error("an Error");
    render(<global.testComponent />);
    const routeErrorDom = screen.queryByTestId("routeErrorError");
    expect(routeErrorDom).toBeInTheDocument();
  });

  it("RouteError with Unknown", async() => {
    global.testData = "an error";
    render(<global.testComponent />);
    const routeErrorDom = screen.queryByTestId("routeUnknownError");
    expect(routeErrorDom).toBeInTheDocument();
  });
});
