import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";

beforeAll(async() => {
  vi.doMock("react-router", () => {
    return {
      useParams() { return { message: global.testData }; },
    };
  });
  global.testComponent = (await import(".")).default;
});

afterAll(() => {
  vi.doUnmock("react-router");
});

describe("Validate ServerError component", () => {
  it("ServerError with param", async() => {
    global.testData = "Hello";
    render(<global.testComponent />);
    const serverErrorDom = screen.queryByTestId("serverError");
    expect(serverErrorDom).toHaveTextContent("Hello");
  });

  it("ServerError without param", async() => {
    global.testData = undefined;
    render(<global.testComponent />);
    const serverErrorDom = screen.queryByTestId("serverError");
    expect(serverErrorDom).toHaveTextContent("Unexpected Error");
  });

});
