import { render, screen } from "@testing-library/react";
import ServerError from ".";

const mockData = vi.hoisted((): { error: unknown } => {
  return {
    error: undefined,
  };
});

vi.mock("react-router", () => {
  return {
    useParams() { return { message: mockData.error }; },
  };
});

describe("Validate ServerError component", () => {
  it("ServerError with param", async() => {
    mockData.error = "Hello";
    render(<ServerError />);
    const serverErrorDom = screen.getByRole("ServerError");
    expect(serverErrorDom).toHaveTextContent("Hello");
  });

  it("ServerError without param", async() => {
    mockData.error = undefined;
    render(<ServerError />);
    const serverErrorDom = screen.getByRole("ServerError");
    expect(serverErrorDom).toHaveTextContent("Unexpected Error");
  });

});
