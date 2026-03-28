import { screen, render, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@client/services/store";
import Header from ".";

const testUser = userEvent.setup();

describe("Header Component validation", () => {
  it("Header no menu if no user", () => {
    render(<Header />);
    const headerDom = screen.getByRole("header");
    expect(headerDom).toBeInTheDocument();
    expect(headerDom).toBeEmptyDOMElement();
  });

  it("Header behavior", async() => {
    act(() => { useAppStore.getState().user.set({ userName: "AnUser" }); });
    render(<Header />);

    expect(useAppStore.getState().user.info).toStrictEqual({
      userName: "AnUser",
    });

    const headerDom = screen.getByRole("header");
    expect(headerDom).toBeInTheDocument();
    expect(headerDom).not.toBeEmptyDOMElement();

    const logOoutDom = within(headerDom).getByRole("logout");
    expect(logOoutDom).toBeInTheDocument();
    await testUser.click(logOoutDom);
    expect(useAppStore.getState().user.info).toBeUndefined();
    expect(headerDom).toBeEmptyDOMElement();

  });

});
