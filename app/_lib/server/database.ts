import Sqlite from 'better-sqlite3';
import { User } from '_lib/user';
export const SqliteError = Sqlite.SqliteError;

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

  public insertUser(userName: string, displayName: string, passwordHash: string) : boolean {
    if (this.stmtInsertUser == null) {
      this.stmtInsertUser = this.db.prepare("INSERT INTO users (userName, displayName, passwordHash, firstLogin, isAdmin) VALUES(?, ?, ?, 1, 0)");
    }
    const info = this.stmtInsertUser.run(userName, displayName, passwordHash);
    return (info.changes != 0);
  }
  private stmtInsertUser: Sqlite.Statement|null = null;

  public selectUserPasswordHash(userName: string): string|undefined {
    if (this.stmtSelectUserPasswordHash == null) {
      this.stmtSelectUserPasswordHash = this.db.prepare("SELECT passwordHash FROM users WHERE userName=?").pluck(true);
    }
    return this.stmtSelectUserPasswordHash.get(userName) as string|undefined;
  }
  private stmtSelectUserPasswordHash: Sqlite.Statement|null = null;


  public updateUserPasswordHash(user: User, passwordHash: string) : boolean {
    if (this.stmtUpdateUserPasswordHash == null) {
      this.stmtUpdateUserPasswordHash = this.db.prepare("UPDATE users SET passwordHash=?, firstLogin=0 WHERE userName=?");
    }
    const info = this.stmtUpdateUserPasswordHash.run(passwordHash, user.userName);
    return (info.changes != 0);
  }
  private stmtUpdateUserPasswordHash: Sqlite.Statement|null = null;

  public listUsers(): Array<User> {
    if (this.stmtListUsers == null) {
      this.stmtListUsers = this.db.prepare("SELECT userName, displayName, firstLogin, isAdmin FROM users");
    }
    return this.stmtListUsers.all().map((row) => User.fromObject(row));
  }
  private stmtListUsers: Sqlite.Statement|null = null;

}

let database:Database|undefined = undefined;
export function getDatabase():Database  {
  if (database == null) database = new Database();
  return database;
}
