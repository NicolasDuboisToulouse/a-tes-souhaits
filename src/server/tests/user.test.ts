import * as user from "@server/user";
import * as bcrypt from "bcrypt";


describe("Validate user module", () => {
  it("check password managment", async() => {
    const hash = user.hashPassword("a_password");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(10);
    expect(user.hashPassword("a_password")).not.toBe(hash);
    expect(bcrypt.compareSync("a_password", hash)).toBe(true);
  });
});
