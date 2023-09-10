import Sqlite from 'better-sqlite3';
import { User } from '_lib/user';
export const SqliteError = Sqlite.SqliteError;

export function getDatabase():Database  {
  if (database == null) database = new Database();
  return database;
}

export function getDbStatement(name: string, query: string, options: {pluck: boolean} = { pluck: false }):Statement  {
  return getDatabase().statement(name, query, options);
}

// Simple Sqlite.Statement wrapper
class Statement {
  private stmt: Sqlite.Statement;

  constructor(stmt: Sqlite.Statement) {
    this.stmt = stmt;
    console.log('New stmt: ' + stmt.source);
  }

  public  run(...args: unknown[]) : boolean {
    return this.stmt.run(...args).changes != 0;
  }

  public get<T>(...args: unknown[]) : T|undefined {
    return this.stmt.get(...args) as T|undefined;
  }

  public all<T>(...args: unknown[]) : Array<T> {
    return this.stmt.all(...args) as Array<T>;
  }
}

// Database class
class Database {
  private db : Sqlite.Database;
  private stmts = new Map<string, Statement>();

  constructor() {
    console.log("[Open DB]");
    this.db = new Sqlite('database/data/database.db', { readonly: false, fileMustExist: true });
    this.db.pragma('journal_mode = WAL');
  }

  public statement(name: string, query: string, options: {pluck: boolean} = { pluck: false }) : Statement {
    if (this.stmts.has(name) == false) {
      const stmt = this.db.prepare(query);
      if (options.pluck) stmt.pluck();
      this.stmts.set(name, new Statement(stmt));
    }
    return this.stmts.get(name)!;
  }

  public selectUser(userName: string) : User {
    if (this.stmtSelectUser == null) {
      this.stmtSelectUser = this.db.prepare("SELECT userName, displayName, firstLogin, isAdmin FROM users WHERE userName=?");
    }
    return User.fromObject(this.stmtSelectUser.get(userName));
  }
  private stmtSelectUser: Sqlite.Statement|null = null;

  public selectUserPasswordHash(userName: string): string|undefined {
    if (this.stmtSelectUserPasswordHash == null) {
      this.stmtSelectUserPasswordHash = this.db.prepare("SELECT passwordHash FROM users WHERE userName=?").pluck(true);
    }
    return this.stmtSelectUserPasswordHash.get(userName) as string|undefined;
  }
  private stmtSelectUserPasswordHash: Sqlite.Statement|null = null;

  public listUsers(): Array<User> {
    if (this.stmtListUsers == null) {
      this.stmtListUsers = this.db.prepare("SELECT userName, displayName, firstLogin, isAdmin FROM users");
    }
    return this.stmtListUsers.all().map((row) => User.fromObject(row));
  }
  private stmtListUsers: Sqlite.Statement|null = null;

  public listLists(): Array<{id: number, title: string}> {
    if (this.stmtListLists == null) {
      this.stmtListLists = this.db.prepare("SELECT id, title FROM lists");
    }
    return this.stmtListLists.all() as Array<{id: number, title: string}>;
  }
  private stmtListLists: Sqlite.Statement|null = null;

  public listListOwners(listId: number): Array<string> {
    if (this.stmtListListOwner == null) {
      this.stmtListListOwner = this.db.prepare("SELECT userName FROM listsOwners WHERE listId=?").pluck();
    }
    return this.stmtListListOwner.all(listId) as Array<string>;
  }
  private stmtListListOwner: Sqlite.Statement|null = null;

  public selectUserList(userName: string): number {
    if (this.stmtSelectUserList == null) {
      // Select the list owned by userName with the lesser number of other owners
      this.stmtSelectUserList = this.db.prepare('\
        SELECT lstCount.listId, COUNT(lstCount.listId) AS count FROM listsOwners AS lstCount \
        INNER JOIN listsOwners AS lstOwner ON lstCount.listId == lstOwner.listId AND lstOwner.userName=? \
        GROUP BY lstCount.listId ORDER BY count');
    }
    const result = this.stmtSelectUserList.get(userName) as { listId: number, count: number } | undefined;
    return (result === undefined)? -1 : result.listId;
  }
  private stmtSelectUserList: Sqlite.Statement|null = null;

}

let database:Database|undefined = undefined;
