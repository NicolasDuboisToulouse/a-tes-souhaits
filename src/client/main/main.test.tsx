import { render, waitFor } from "@testing-library/react";
import { handleRequestError, requestTokenLogin, User } from "@client/protocol";
import Main from "./main";
import Login from "@client/components/Login";
import { Routes } from "react-router";
import { useAppStore } from "@client/services/store";

//
// Mock protocol
//
const mockData = vi.hoisted((): { tockenLoginResult: User | undefined | Error } => {
  return {
    tockenLoginResult: undefined,
  };
});

vi.mock("@client/protocol", async(importOriginal) => {
  const actual: unknown[] = await importOriginal();
  return {
    ...actual,
    handleRequestError: vi.fn(),
    requestTokenLogin: vi.fn((): Promise<User | undefined> => {
      if (mockData.tockenLoginResult instanceof Error) return Promise.reject(mockData.tockenLoginResult);
      return Promise.resolve(mockData.tockenLoginResult);
    }),
  };
});

//
// Mock components
//
vi.mock("@client/components/Login", () => {
  return { default: vi.fn() };
});
vi.mock("react-router", async(importOriginal) => {
  const actual: unknown[] = await importOriginal();
  return {
    ...actual,
    Routes: vi.fn(),
  };
});

//
// Test
//
describe("Main component", () => {

  afterEach(() => {
    vi.resetAllMocks();
    mockData.tockenLoginResult = undefined;
  });

  it("auto-login Error", async() => {
    mockData.tockenLoginResult = new Error("Failure");
    render(<Main />);
    expect(requestTokenLogin).toHaveBeenCalled();
    expect(Login).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(Login).toHaveBeenCalled();
    });
    expect(handleRequestError).toHaveBeenCalledWith(new Error("Failure"));
    expect(useAppStore.getState().user.info).toBeUndefined();
  });

  it("auto-login fail", async() => {
    render(<Main />);
    expect(requestTokenLogin).toHaveBeenCalled();
    expect(Login).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(Login).toHaveBeenCalled();
    });
    expect(handleRequestError).not.toHaveBeenCalledWith();
    expect(useAppStore.getState().user.info).toBeUndefined();
  });

  it("auto-login success", async() => {
    mockData.tockenLoginResult = {
      userName: "User",
      displayName: "AnUserDisplayName",
      isAdmin: false,
      firstLogin: false,
    };
    render(<Main />);
    expect(requestTokenLogin).toHaveBeenCalled();
    expect(Login).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(Routes).toHaveBeenCalled();
    });
    expect(useAppStore.getState().user.info).toStrictEqual({
      userName: "User",
      displayName: "AnUserDisplayName",
      isAdmin: false,
      firstLogin: false,
    });
  });

});
