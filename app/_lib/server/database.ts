import Sqlite from 'better-sqlite3';
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
}

let database:Database|undefined = undefined;
