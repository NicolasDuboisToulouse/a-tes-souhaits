import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@client/services/store";
import { LoginInfo, User } from "@server/protocol";
import { requestLogin } from "@shared/protocol/generated/client";
import Login from ".";

vi.mock("@shared/protocol/generated/client", async(importOriginal) => {
  const actual: unknown[] = await importOriginal();
  return {
    ...actual,
    requestLogin: vi.fn((request: LoginInfo): Promise<User> => {
      return Promise.resolve<User>({
        userName: request.userName,
      });
    }),
  };
});

describe("Login component", () => {

  it("Login component", async() => {
    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByLabelText(/Nom/), "userName");
    await user.type(screen.getByLabelText(/Mot/), "passowrd");
    await user.click(screen.getByRole("button", { name: /connexion/i }));

    expect(requestLogin).toHaveBeenCalledWith({
      password: "passowrd",
      userName: "userName",
    });

    expect(useAppStore.getState().user.info).toStrictEqual({
      userName: "userName",
    });
  });
});
