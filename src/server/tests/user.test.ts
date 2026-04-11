import * as user from "@server/core/user";
import * as bcrypt from "bcrypt";
import * as testDatabase from "./test-database";
import { clientRequest, isResponseError } from "@tests/server/utils";
import { createExpressApp } from "@server/core/server";
import { LoginInfo } from "@server/core/protocol";


describe("Validate user helper", () => {
  beforeAll(() => {
    testDatabase.create("user_helper");
  });
  afterAll(() => {
    testDatabase.remove("user_helper");
  });

  it("check password managment", () => {
    const hash = user.hashPassword("a_password");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(10);
    expect(user.hashPassword("a_password")).not.toBe(hash);
    expect(bcrypt.compareSync("a_password", hash)).toBe(true);
    expect(user.checkPassword("a_password", hash)).toBe(true);
    expect(user.checkPassword("another_password", hash)).toBe(false);
  });

  it("get shall works", () => {
    expect(user.get("user1")).toStrictEqual({
      userName: "user1",
      displayName: "user1",
      firstLogin: 0,
      isAdmin: true,
    });

    expect(user.get("user2")).toStrictEqual({
      userName: "user2",
      displayName: "user2",
      firstLogin: 1,
      isAdmin: false,
    });

    expect(() => user.get("not_exists")).toThrow();
  });

});

describe("Validate user rest api", () => {
  beforeAll(() => {
    testDatabase.create("user_api");
  });
  afterAll(() => {
    testDatabase.remove("user_api");
  });

  it("requestLogin validation", async() => {
    const app = await createExpressApp();

    await clientRequest(app, "/api/user/login")
      .expect("Content-type", /application\/json/)
      .expect(
        isResponseError());

    let loginInfo: LoginInfo = {
      userName: "no_exists",
      password: "not_a_pass",
    };
    await clientRequest(app, "/api/user/login", loginInfo)
      .expect("Content-type", /application\/json/)
      .expect(
        isResponseError());

    loginInfo = {
      userName: "user1",
      password: "not_a_pass",
    };
    await clientRequest(app, "/api/user/login", loginInfo)
      .expect("Content-type", /application\/json/)
      .expect(
        isResponseError());

    loginInfo = {
      userName: "user1",
      password: "password1",
    };
    await clientRequest(app, "/api/user/login", loginInfo)
      .expect("Content-type", /application\/json/)
      .expect({
        displayName: "user1",
        firstLogin: 0,
        isAdmin: true,
        userName: "user1",
      });
  });
});
