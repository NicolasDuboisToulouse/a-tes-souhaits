import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@client/services/store";
import {
  handleRequestError,
  requestLogin,
  LoginInfo,
  User,
} from "@client/protocol";
import Login from ".";

const user = userEvent.setup();

//
// Mock protocol
//
const mockData = vi.hoisted((): { loginSucess: boolean } => {
  return {
    loginSucess: false,
  };
});

vi.mock("@client/protocol", async(importOriginal) => {
  const actual: unknown[] = await importOriginal();
  return {
    ...actual,
    handleRequestError: vi.fn(),
    requestLogin: vi.fn((request: LoginInfo): Promise<User> => {
      if (mockData.loginSucess) return Promise.reject();
      return Promise.resolve<User>({
        userName: request.userName,
      });
    }),
  };
});


//
// Tets
//
describe("Login component", () => {

  afterEach(() => {
    vi.resetAllMocks();
    mockData.loginSucess = false;
  });

  it("Manual loggin error", async() => {
    render(<Login />);

    mockData.loginSucess = true;
    await user.type(screen.getByLabelText(/Nom/), "userName");
    await user.type(screen.getByLabelText(/Mot/), "passowrd");
    await user.click(screen.getByRole("button", { name: /connexion/i }));

    expect(requestLogin).toHaveBeenCalledWith({
      password: "passowrd",
      userName: "userName",
    });
    expect(handleRequestError).toHaveBeenCalled();

    expect(useAppStore.getState().user.info).toBe(undefined);
  });

  it("Manual loggin success", async() => {
    render(<Login />);

    await user.type(screen.getByLabelText(/Nom/), "userName");
    await user.type(screen.getByLabelText(/Mot/), "passowrd");
    await user.click(screen.getByRole("button", { name: /connexion/i }));

    expect(requestLogin).toHaveBeenCalledWith({
      password: "passowrd",
      userName: "userName",
    });
    expect(handleRequestError).not.toHaveBeenCalled();

    expect(useAppStore.getState().user.info).toStrictEqual({
      userName: "userName",
    });
  });
});
