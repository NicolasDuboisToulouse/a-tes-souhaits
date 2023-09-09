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


  public updateUserPasswordHash(userName: string, passwordHash: string) : boolean {
    if (this.stmtUpdateUserPasswordHash == null) {
      this.stmtUpdateUserPasswordHash = this.db.prepare("UPDATE users SET passwordHash=?, firstLogin=0 WHERE userName=?");
    }
    const info = this.stmtUpdateUserPasswordHash.run(passwordHash, userName);
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

  public updateUserIsAdmin(userName: string, isAdmin: boolean) : boolean {
    if (this.stmtUpdateUserIsAdmin == null) {
      this.stmtUpdateUserIsAdmin = this.db.prepare("UPDATE users SET isAdmin=? WHERE userName=?");
    }
    const info = this.stmtUpdateUserIsAdmin.run(isAdmin? 1 : 0, userName);
    return (info.changes != 0);
  }
  private stmtUpdateUserIsAdmin: Sqlite.Statement|null = null;

  public deleteUser(userName: string) : boolean {
    if (this.stmtDeleteUser == null) {
      this.stmtDeleteUser = this.db.prepare("DELETE FROM users WHERE userName=?");
    }
    const info = this.stmtDeleteUser.run(userName);
    return (info.changes != 0);
  }
  private stmtDeleteUser: Sqlite.Statement|null = null;

}

let database:Database|undefined = undefined;
export function getDatabase():Database  {
  if (database == null) database = new Database();
  return database;
}
