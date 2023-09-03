import Sqlite from 'better-sqlite3';

import { User } from '_lib/user';

class Database {
  private db : Sqlite.Database;

  constructor() {
    console.log("** Create DB ***");
    this.db = new Sqlite('database/data/database.db', { readonly: false, fileMustExist: true });
    this.db.pragma('journal_mode = WAL');
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
}

let database:Database|undefined = undefined;
export function getDatabase():Database  {
  if (database == null) database = new Database();
  return database;
}