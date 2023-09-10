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
    if (this.stmtDeleteListOwnerByOwner == null) {
      this.stmtDeleteListOwnerByOwner = this.db.prepare("DELETE FROM listsOwners WHERE userName=?");
    }
    if (this.stmtDeleteUser.run(userName).changes != 0) {
      this.stmtDeleteListOwnerByOwner.run(userName);
      return true;
    }
    return false;
  }
  private stmtDeleteUser: Sqlite.Statement|null = null;
  private stmtDeleteListOwnerByOwner: Sqlite.Statement|null = null;

  public listLists(): Array<{id: number, title: string}> {
    if (this.stmtListLists == null) {
      this.stmtListLists = this.db.prepare("SELECT id, title FROM lists");
    }
    return this.stmtListLists.all() as Array<{id: number, title: string}>;
  }
  private stmtListLists: Sqlite.Statement|null = null;

  public insertList(title: string) : boolean {
    if (this.stmtInsertList == null) {
      this.stmtInsertList = this.db.prepare("INSERT INTO lists (title) VALUES(?)");
    }
    const info = this.stmtInsertList.run(title);
    return (info.changes != 0);
  }
  private stmtInsertList: Sqlite.Statement|null = null;

  public deleteList(id: number) : boolean {
    if (this.stmtDeleteList == null) {
      this.stmtDeleteList = this.db.prepare("DELETE FROM lists WHERE id=?");
    }
    if (this.stmtDeleteListOwnerByListId == null) {
      this.stmtDeleteListOwnerByListId = this.db.prepare("DELETE FROM listsOwners WHERE listId=?");
    }
    if (this.stmtDeleteList.run(id).changes != 0) {
      this.stmtDeleteListOwnerByListId.run(id);
      return true;
    }
    return false;
  }
  private stmtDeleteList: Sqlite.Statement|null = null;
  private stmtDeleteListOwnerByListId: Sqlite.Statement|null = null;

  public insertListOwner(listId: number, userName: string) : boolean {
    if (this.stmtInsertListOwner == null) {
      this.stmtInsertListOwner = this.db.prepare("INSERT INTO listsOwners (listId, userName) VALUES(?, ?)");
    }
    const info = this.stmtInsertListOwner.run(listId, userName);
    return (info.changes != 0);
  }
  private stmtInsertListOwner: Sqlite.Statement|null = null;

  public listListOwners(listId: number): Array<string> {
    if (this.stmtListListOwner == null) {
      this.stmtListListOwner = this.db.prepare("SELECT userName FROM listsOwners WHERE listId=?").pluck();
    }
    return this.stmtListListOwner.all(listId) as Array<string>;
  }
  private stmtListListOwner: Sqlite.Statement|null = null;

  public deleteListOwner(listId: number, userName: string) : boolean {
    if (this.stmtDeleteListOwner == null) {
      this.stmtDeleteListOwner = this.db.prepare("DELETE FROM listsOwners WHERE listId=? AND userName=?");
    }
    return this.stmtDeleteListOwner.run(listId, userName).changes != 0;
  }
  private stmtDeleteListOwner: Sqlite.Statement|null = null;

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
export function getDatabase():Database  {
  if (database == null) database = new Database();
  return database;
}
