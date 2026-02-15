import * as database from "@server/database";
import fs from "fs";
import path from "path";

describe("Validate database module", () => {

  it("check database generation errors", () => {
    if (typeof process.env.DATABASE_DIR !== "string") throw new Error("env DATABASE_DIR is unset!");
    const mockExit = vi.spyOn(process, "exit").mockImplementation(() => { throw new Error(); });

    expect(() => database.get()).toThrow();

    const database_dir = process.env.DATABASE_DIR;
    delete process.env.DATABASE_DIR;
    expect(() => database.init()).toThrow();
    process.env.DATABASE_DIR = database_dir;

    fs.rmSync(process.env.DATABASE_DIR, { force: true, recursive: true });
    const fd = fs.openSync(process.env.DATABASE_DIR, "w");
    fs.closeSync(fd);
    expect(() => database.init()).toThrow();

    fs.rmSync(process.env.DATABASE_DIR, { force: true, recursive: true });
    fs.mkdirSync(path.join(process.env.DATABASE_DIR, "database.db"), { recursive: true });
    expect(() => database.init()).toThrow();
    fs.rmSync(process.env.DATABASE_DIR, { force: true, recursive: true });

    const schemaDir = process.env.DATABASE_SCHEMAS;
    delete process.env.DATABASE_SCHEMAS;
    expect(() => database.init()).toThrow();
    process.env.DATABASE_SCHEMAS = path.join(process.env.TESTS_RESULT_DIR!, "fake_schemas");
    expect(() => database.init()).toThrow();
    const fd2 = fs.openSync(process.env.DATABASE_SCHEMAS, "w");
    fs.closeSync(fd2);
    expect(() => database.init()).toThrow();
    process.env.DATABASE_SCHEMAS = schemaDir;

    mockExit.mockRestore();
  });

  it("check database generation success", () => {
    if (typeof process.env.DATABASE_DIR !== "string") throw new Error("env DATABASE_DIR is unset!");
    fs.rmSync(process.env.DATABASE_DIR, { force: true, recursive: true });
    database.init();

    const db = database.get();
    expect(db instanceof database.Database).toBe(true);
    const tblStmt = database.select<string>("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", database.pluck);
    expect(tblStmt.get("users")).toBe("users");
    expect(tblStmt.get("lists")).toBe("lists");
    expect(tblStmt.get("listsOwners")).toBe("listsOwners");
    expect(tblStmt.get("wishes")).toBe("wishes");
    expect(tblStmt.get("notExists")).toBe(undefined);

    function allUserStmt() {
      return database.select<
        { userName: string; displayName: string; firstLogin: number; isAdmin: number }
      >("SELECT userName, displayName, firstLogin, isAdmin from users");
    }

    // Check there is only the admin user
    expect(allUserStmt().all()).toStrictEqual([ { userName: "admin", displayName: "admin", firstLogin: 1, isAdmin: 1 } ]);

    // Remove admin and check init() add it again
    const removeAllStmt = database.statement("DELETE FROM users");
    expect(removeAllStmt.run()).toBe(true);
    expect(allUserStmt().all()).toStrictEqual([]);
    database.init();
    expect(allUserStmt().all()).toStrictEqual([ { userName: "admin", displayName: "admin", firstLogin: 1, isAdmin: 1 } ]);


    // Remove admin rights, check init() add it again
    const removeRightsStmt = database.statement("UPDATE users SET isAdmin = 0");
    expect(removeRightsStmt.run()).toBe(true);
    expect(allUserStmt().all()).toStrictEqual([ { userName: "admin", displayName: "admin", firstLogin: 1, isAdmin: 0 } ]);
    database.init();
    expect(allUserStmt().all()).toStrictEqual([ { userName: "admin", displayName: "admin", firstLogin: 1, isAdmin: 1 } ]);

    // Set admin rights to another user. init() shall not do anything
    const changeUserStmt = database.statement("UPDATE users SET userName = 'jhon'");
    expect(changeUserStmt.run()).toBe(true);
    expect(allUserStmt().all()).toStrictEqual([ { userName: "jhon", displayName: "admin", firstLogin: 1, isAdmin: 1 } ]);
    database.init();
    expect(allUserStmt().all()).toStrictEqual([ { userName: "jhon", displayName: "admin", firstLogin: 1, isAdmin: 1 } ]);

    database.close();
  });

  it("check database statements", () => {
    if (typeof process.env.DATABASE_DIR !== "string") throw new Error("env DATABASE_DIR is unset!");
    fs.rmSync(process.env.DATABASE_DIR, { force: true, recursive: true });
    database.init();

    const insStmt = database.statement(
      "INSERT INTO users (userName, displayName, passwordHash, firstLogin, isAdmin) VALUES (?, ?, ?, ?, ?)"
    );
    insStmt.run("user1", "user1", "hash1", 0, 1);
    insStmt.run("user2", "user2", "hash2", 1, 0);

    const userGet = database.select<
      { userName: string; displayName: string; firstLogin: number; isAdmin: number }
    >("SELECT userName, displayName, firstLogin, isAdmin from users");

    expect(userGet.all()).toStrictEqual(
      [
        { userName: "admin", displayName: "admin", firstLogin: 1, isAdmin: 1 },
        { userName: "user1", displayName: "user1", firstLogin: 0, isAdmin: 1 },
        { userName: "user2", displayName: "user2", firstLogin: 1, isAdmin: 0 },
      ]
    );

    expect(userGet.get()).toStrictEqual(
      { userName: "admin", displayName: "admin", firstLogin: 1, isAdmin: 1 },
    );

    const userGetPluck = database.select<string>(
      "SELECT userName, displayName, firstLogin, isAdmin from users",
      database.pluck,
    );
    expect(userGetPluck.get()).toBe("admin");
    expect(userGetPluck.all()).toStrictEqual([ "admin", "user1", "user2" ]);

    database.close();
  });
});
