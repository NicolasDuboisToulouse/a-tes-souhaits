import Sqlite from "better-sqlite3";
import fs from "fs";
import path from "path";
import logger from "@server/logger";
import * as error from "@server/error";
import * as user from "@server/user";

//
// Initialize and database access
//
let database: Database | undefined = undefined;
export function init() {
  database = new Database();
}

export function close() {
  if (database) {
    database.close();
  }
}
export function get(): Database {
  if (database === undefined) {
    error.die("Database is not initialized !");
  }
  return database;
}

//
// Generic types
//
type SqlType = number | string | null;
type RowType = Record<string, SqlType>;
type SelectType = RowType | SqlType;

//
// Define pluck to clarify statement Cor
// When a statement is pluck, for each result, return only the first column,
// instead of an object of all columns
//
type PluckType = boolean;
export const pluck: PluckType = true;

//
// A base statement that cannot return data.
// Statements are stored to prevent a call to prepare() each time.
//
class StatementBase {
  protected stmt: Sqlite.Statement;
  private static store = new Map<string, Sqlite.Statement>();

  constructor(query: string) {
    if (StatementBase.store.has(query)) {
      this.stmt = StatementBase.store.get(query)!;
      logger.debug("REUSE statement: " + this.stmt.source);
    } else {
      this.stmt = get().prepare(query);
      StatementBase.store.set(query, this.stmt);
      logger.debug("New statement: " + this.stmt.source);
    }
  }

  // Run the statement, return true if any row has been changed.
  // ...args: replace '?' in statement query. Order and count must match.
  // Throw an Error on error.
  public run(...args: SqlType[]): boolean {
    return this.stmt.run(...args).changes !== 0;
  }

  // Clear stored statement
  public static clearStore() {
    StatementBase.store.clear();
  }
}

//
// A statement that return data. See also StatementBase.
// SelectType allows to type the return value (for typescript check & completion).
//   if statement is not pluck, SelectType type a row. Example: { name: string, age: number }.
//   if statement is not pluck, SelectType type the first columns. Example: string.
//
class StatementSelect<SelType extends SelectType> extends StatementBase {
  constructor(query: string, pluck?: PluckType) {
    super(query);
    this.stmt.pluck(pluck ? true : false);
  }

  // Get a single row by running the statement. (The first row if several results).
  // ...args: replace '?' in statement query. Order and count must match.
  // Return SelectType on success, undefined if not found or throw an Error on error.
  public get(...args: SqlType[]): SelType | undefined {
    return this.stmt.get(...args) as SelType | undefined;
  }

  // Get all rows by running the statement.
  // ...args: replace '?' in statement query. Order and count must match.
  // Return SelectType[] on success (might be empty) or throw an Error on error.
  public all(...args: SqlType[]): SelType[] {
    return this.stmt.all(...args) as SelType[];
  }
}

//
// Create a base statement. See StatementBase.
//
export function statement(query: string): StatementBase {
  return new StatementBase(query);
}

//
// Create a statement that return value(s). See StatementSelect.
//
export function select<SelType extends SelectType>(query: string, pluck?: PluckType): StatementSelect<SelType> {
  return new StatementSelect<SelType>(query, pluck);
}


//
// Sqlite.Database wrapper
//
export class Database {
  private db: Sqlite.Database;

  //
  // Return a prepared Sqlite.Statement
  //
  public prepare(query: string): Sqlite.Statement {
    return this.db.prepare(query);
  }

  //
  // Open database. Create it if needed.
  //
  constructor() {
    logger.info("[Open database]");

    if (typeof process.env.DATABASE_DIR !== "string") {
      error.die("env DATABASE_DIR is not set !");
    }
    try {
      fs.mkdirSync(process.env.DATABASE_DIR, { recursive: true });
    } catch(err) {
      if (err instanceof Error) {
        error.die(`Cannot create database dir ${process.env.DATABASE_DIR}: ${err.message}`);
      } else {
        error.die(`Cannot create database dir ${process.env.DATABASE_DIR}`);
      }
    }
    const database_file = path.join(process.env.DATABASE_DIR, "database.db");
    try {
      if (database) database.close();
      this.db = new Sqlite(database_file, { readonly: false, fileMustExist: false });
    } catch(err) {
      if (err instanceof Error) {
        error.die(`Failled to create or load database ${database_file}: ${err.message}`);
      } else {
        error.die(`Failled to create or load database ${database_file}`);
      }
    }

    this.db.pragma("journal_mode = WAL");
    this.update();
  }

  //
  // Close the database
  //
  public close() {
    logger.info("[Database] Shutdown");
    StatementBase.clearStore();
    this.db.close();
    database = undefined;
  }

  //
  // Create or update database by executing files schemas/db_<version>.sql.
  // All db_<version>.sql needn't to exists but:
  //  - the first db_<version>.sql must create database <version>
  //  - next db_<version>.sql must upgrade database to <version>
  //
  private update() {
    // Look for schemas files schemas/db_<version>.sql
    // Store them in schemas { <version> => <sqls> }
    // Stote the greater <version> in target_db_version.
    logger.debug("[UpdateDB] Looking for schemas...");
    const schemas = new Map<number, string>();
    let target_db_version = 0;

    if (process.env.DATABASE_SCHEMAS === undefined ||
      fs.existsSync(process.env.DATABASE_SCHEMAS) === false ||
      fs.statSync(process.env.DATABASE_SCHEMAS).isDirectory() === false) {
      this.close();
      error.die(`Invalid env DATABASE_SCHEMAS (${process.env.DATABASE_SCHEMAS})`);
    }
    const files = fs.readdirSync(process.env.DATABASE_SCHEMAS);
    files.forEach((file: string) => {
      const match = file.match(/^db_([0-9]+)\.sql$/);
      if (match == null) return;
      const version = parseInt(match[1]);
      if (isNaN(version)) return;
      const schema_path = path.join(process.env.DATABASE_SCHEMAS!, file);
      schemas.set(version, fs.readFileSync(schema_path).toString());
      if (version > target_db_version) target_db_version = version;
    });

    logger.debug("[UpdateDB] " + schemas.size + " schemas found. Target db version: " + target_db_version + ".");

    // Get current db version
    const current_version = this.db.pragma("user_version", { simple: true }) as number;
    logger.debug("[UpdateDB] Current database version: " + current_version + ".");

    // Update to latest
    if (current_version === 0) {
      this.db.prepare("PRAGMA foreign_keys=OFF").run();
    }
    for (let version = current_version + 1; version <= target_db_version; version++) {
      if (schemas.has(version)) {
        this.db.transaction(() => {
          logger.info("[UpdateDB] Update database to version " + version + "...");
          this.db.exec(schemas.get(version)!);
          this.db.prepare("PRAGMA user_version=" + version).run();
        }) ();
      }
    }

    // Add an admin if none exists
    const admin = this.db
      .prepare("SELECT userName FROM users WHERE isAdmin=1")
      .pluck()
      .get();
    if (admin == null) {
      const admin = this.db
        .prepare("SELECT userName FROM users WHERE userName='admin'")
        .pluck()
        .get();
      if (admin == null) {
        logger.warn("[UpdateDB] No administrator found. Add default administrator: admin/admin.");
        const admin_password_hash = user.hashPassword("admin");
        this.db.prepare("INSERT INTO users " +
          "(userName, displayName, passwordHash, firstLogin, isAdmin) " +
          "VALUES('admin', 'admin', ?, 1, 1)")
          .run(admin_password_hash);
      } else {
        logger.warn("[UpdateDB] No administrator found. Grant administrator rights to user admin.");
        this.db.prepare("UPDATE users SET isAdmin=1 WHERE userName='admin'").run();
      }
    }

    logger.info("[UpdateDB] Database is up to date.");
  }
}
