import Sqlite from 'better-sqlite3';
export const SqliteError = Sqlite.SqliteError;
import * as path from 'path';
import * as fs from 'fs';
import * as loginService from '_lib/server/loginService';
import { logger } from '_lib/server/applicationError';

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
    logger.debug('New stmt: ' + stmt.source);
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
    logger.info("[Open DB]");
    try {
      this.db = new Sqlite('database/database.db', { readonly: false, fileMustExist: false });
    } catch(error) {
      const db_dir_stat = fs.statSync('database', { throwIfNoEntry: false });
      if (db_dir_stat == null || db_dir_stat.isDirectory() == false) {
        logger.error('Folder "database" does not exists !');
        logger.error('In a docker container, "database" shall be a volume !');
      } else {
        logger.error(error);
      }
      throw error;
    }
    this.db.pragma('journal_mode = WAL');
    this.update();
  }

  public statement(name: string, query: string, options: {pluck: boolean} = { pluck: false }) : Statement {
    if (this.stmts.has(name) == false) {
      const stmt = this.db.prepare(query);
      if (options.pluck) stmt.pluck();
      this.stmts.set(name, new Statement(stmt));
    }
    return this.stmts.get(name)!;
  }

  /*
   * Create or update database by executing files schemas/db_<version>.sql.
   * All db_<version>.sql needn't to exists but:
   *  - the first db_<version>.sql must create database <version>
   *  - next db_<version>.sql must upgrade database to <version>
   */
  private update() {
    /*
     * Look for schemas files schemas/db_<version>.sql
     * Store them in schemas { <version> => <sqls> }
     * Stote the greater <version> in db_version.
     */
    logger.debug('[UpdateDB] Looking for schemas...');
    let schemas = new Map<number, string>();
    let db_version = 0;

    const schemas_path = path.join(process.cwd(), 'schemas');
    const files = fs.readdirSync(schemas_path);
    files.forEach((file: string) => {
      const match = file.match(/^db_([0-9]+)\.sql$/);
      if (match == null) return;
      const version = parseInt(match[1]);
      if (isNaN(version)) return;
      const schema_path = path.join(schemas_path, file);
      schemas.set(version, fs.readFileSync(schema_path).toString());
      if (version > db_version) db_version = version;
    });

    logger.debug('[UpdateDB] ' + schemas.size + ' schemas found. Target db version: ' + db_version + '.');

    // Get current db version
    const current_version = this.db.pragma('user_version', { simple: true }) as number;
    logger.debug('[UpdateDB] Current database version: ' + current_version + '.');

    // Update to latest
    if (current_version == 0) {
      this.db.prepare('PRAGMA foreign_keys=OFF').run();
    }
    for(let version = current_version + 1; version <= db_version; version++) {
      if (schemas.has(version)) {
        this.db.transaction( () => {
          logger.info('[UpdateDB] Update database to version ' + version + '...');
          this.db.exec(schemas.get(version)!);
          this.db.prepare('PRAGMA user_version=' + version).run();
        }) ();
      }
    }

    // Add an admin if none exists
    const admin = this.db.prepare("SELECT userName FROM users WHERE isAdmin=1").pluck().get();
    if (admin == null) {
      const admin = this.db.prepare("SELECT userName FROM users WHERE userName='admin'").pluck().get();
      if (admin == null) {
        logger.warn('[UpdateDB] No administrator found. Add default administrator: admin/admin.');
        const admin_password_hash = loginService.getPasswordHash('admin');
        this.db.prepare("INSERT INTO users (userName, displayName, passwordHash, firstLogin, isAdmin) VALUES('admin', 'admin', ?, 1, 1)").
          run(admin_password_hash);
      } else {
        logger.warn('[UpdateDB] No administrator found. Grant administrator rights to user admin.');
        this.db.prepare("UPDATE users SET isAdmin=1 WHERE userName='admin'").run();
      }
    }

    logger.info('[UpdateDB] Database is up to date.');
  }
}

let database:Database|undefined = undefined;
