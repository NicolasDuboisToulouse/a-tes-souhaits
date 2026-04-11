import { screen, render, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@client/services/store";
import { BrowserRouter } from "react-router";
import Header from ".";

// mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router", async(importOriginal) => {
  const actual: unknown[] = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(() => { return mockNavigate; }),
  };
});


const testUser = userEvent.setup();

describe("Header Component validation", () => {

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Return HeaderDom + MenuDom
  async function openMenu(isAdmin: boolean = false): Promise<[HTMLElement, HTMLElement]> {
    act(() => {
      useAppStore.getState().user.set({
        userName: "AnUser",
        isAdmin,
      });
    });
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    );

    expect(useAppStore.getState().user.info).toStrictEqual({
      userName: "AnUser",
      isAdmin,
    });
    const headerDom = screen.getByRole("header");
    expect(headerDom).toBeInTheDocument();
    expect(headerDom).not.toBeEmptyDOMElement();

    const hidderMenuDom = within(headerDom).queryByRole("menuHeader");
    expect(hidderMenuDom).not.toBeInTheDocument();

    const menuButtonDom = within(headerDom).getByRole("button");
    expect(menuButtonDom).toBeInTheDocument();

    await testUser.click(menuButtonDom);
    const visibleMenuDom = within(headerDom).getByRole("menuHeader");
    expect(visibleMenuDom).toBeInTheDocument();

    return [ headerDom, visibleMenuDom ];
  }

  it("Header as no menu if no user", () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    );
    const headerDom = screen.getByRole("header");
    expect(headerDom).toBeInTheDocument();
    expect(headerDom).toBeEmptyDOMElement();
  });

  it("Header close if click outside", async() => {
    const [ headerDom ] = await openMenu();
    await testUser.click(headerDom);
    const menuDom = within(headerDom).queryByRole("menuHeader");
    expect(menuDom).not.toBeInTheDocument();
  });

  it("Header logout behavior", async() => {
    const [ headerDom, visibleMenuDom ] = await openMenu();

    const logOoutDom = within(visibleMenuDom).getByRole("logout");
    expect(logOoutDom).toBeInTheDocument();
    await testUser.click(logOoutDom);
    expect(useAppStore.getState().user.info).toBeUndefined();
    expect(headerDom).toBeEmptyDOMElement();
  });

  it("Header changePassword behavior", async() => {
    const [ _, visibleMenuDom ] = await openMenu();

    const changePasswordDom = within(visibleMenuDom).getByRole("changePassword");
    expect(changePasswordDom).toBeInTheDocument();
    await testUser.click(changePasswordDom);
    expect(mockNavigate).toHaveBeenCalledWith("/changePassword");
  });

  it("Header gotoHome behavior", async() => {
    const [ _, visibleMenuDom ] = await openMenu();

    const gotoHomeDom = within(visibleMenuDom).getByRole("gotoHome");
    expect(gotoHomeDom).toBeInTheDocument();
    await testUser.click(gotoHomeDom);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("Header gotoAbout behavior", async() => {
    const [ _, visibleMenuDom ] = await openMenu();

    const gotoAboutDom = within(visibleMenuDom).getByRole("gotoAbout");
    expect(gotoAboutDom).toBeInTheDocument();
    await testUser.click(gotoAboutDom);
    expect(mockNavigate).toHaveBeenCalledWith("/about");
  });

  it("Header gotoAdmin behavior", async() => {
    const [ _, visibleMenuDom ] = await openMenu(true);

    const gotoAdminDom = within(visibleMenuDom).getByRole("gotoAdmin");
    expect(gotoAdminDom).toBeInTheDocument();
    await testUser.click(gotoAdminDom);
    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });

  it("Header gotoAdmin behavior", async() => {
    const [ _, visibleMenuDom ] = await openMenu(false);

    const gotoAdminDom = within(visibleMenuDom).queryByRole("gotoAdmin");
    expect(gotoAdminDom).not.toBeInTheDocument();
  });

});
