import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@client/services/store";
import {
  handleRequestError,
  requestTokenLogin,
  requestLogin,
  LoginInfo,
  User,
} from "@client/protocol";
import Login from ".";

const mockData = vi.hoisted((): { failRequests: boolean } => {
  return {
    failRequests: false,
  };
});

vi.mock("@client/protocol", async(importOriginal) => {
  const actual: unknown[] = await importOriginal();
  return {
    ...actual,
    handleRequestError: vi.fn(),
    requestTokenLogin: vi.fn((): Promise<User | undefined> => {
      if (mockData.failRequests) return Promise.reject();
      return Promise.resolve(undefined);
    }),
    requestLogin: vi.fn((request: LoginInfo): Promise<User> => {
      if (mockData.failRequests) return Promise.reject();
      return Promise.resolve<User>({
        userName: request.userName,
      });
    }),
  };
});

describe("Login component", () => {

  afterEach(() => {
    vi.resetAllMocks();
    mockData.failRequests = false;
  });

  it("Auto logon error", async() => {
    mockData.failRequests = true;
    render(<Login />);

    // Wait for auto login done
    expect(await screen.findByRole("form", { name: "" })).toBeInTheDocument();
    expect(requestTokenLogin).toHaveBeenCalled();
    expect(handleRequestError).toHaveBeenCalled();
  });

  it("Manual loggin error", async() => {
    const user = userEvent.setup();
    render(<Login />);

    // Wait for auto login done
    expect(await screen.findByRole("form", { name: "" })).toBeInTheDocument();
    expect(requestTokenLogin).toHaveBeenCalled();
    expect(handleRequestError).not.toHaveBeenCalled();

    mockData.failRequests = true;
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
    const user = userEvent.setup();
    render(<Login />);

    // Auto login: nothing displayed
    expect(screen.queryByRole("form", { name: "" })).not.toBeInTheDocument();

    // Wait for auto login done
    expect(await screen.findByRole("form", { name: "" })).toBeInTheDocument();
    expect(requestTokenLogin).toHaveBeenCalled();
    expect(handleRequestError).not.toHaveBeenCalled();

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
