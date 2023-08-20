/*
 * Create or update database by executing files schemas/db_<version>.sql.
 * All db_<version>.sql needn't to exists but:
 *  - the first db_<version>.sql must create database <version>
 *  - next db_<version>.sql must upgrade database to <version>
 */
import Database from 'better-sqlite3';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as fs from 'fs';

/*
 * Look for schemas files schemas/db_<version>.sql
 * Store them in schemas { <version> => <sqls> }
 * Stote the greater <version> in db_version.
 */
console.log('Looking for schemas...');
let schemas = new Map<number, string>();
let db_version = 0;

const schemas_path = path.join(__dirname, 'schemas');
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

console.log(schemas.size + ' schemas found. Target db version: ' + db_version + '.');

// Check data folder exists or create it
// In a docker container, it shall be a volume
const db_dir = path.join(__dirname, '/data/');
const db_dir_stat = fs.statSync(db_dir, { throwIfNoEntry: false });
if (db_dir_stat == null || db_dir_stat.isDirectory() == false) {
  console.log('WARNING: crrating directory ' + db_dir + '. In a docker container, it shall be a volume.');
  fs.mkdirSync(db_dir);
  const db_dir_stat = fs.statSync(db_dir, { throwIfNoEntry: false });
  if (db_dir_stat == null || db_dir_stat.isDirectory() == false) {
    console.log("Failed to create directory " + db_dir);
    process.exit(1);
  }
}

// Open database
const db_path = path.join(db_dir, 'database.db');
console.log('Create or open database: ' + db_path);

const db = new Database(db_path, { readonly: false, fileMustExist: false });
const user_version:number = db.pragma('user_version', { simple: true }) as number;
console.log('Current database version: ' + user_version + '.');
if (user_version == 0) {
  db.prepare('PRAGMA foreign_keys=OFF').run();
}

// Update database to last version
for(let version = user_version + 1; version <= db_version; version++) {
  if (schemas.has(version)) {
    db.transaction( () => {
      console.log('Update database to version ' + version + '...');
      db.exec(schemas.get(version)!);
      db.prepare('PRAGMA user_version=' + version).run();
    }) ();
  }
}

// Add an admin if none exists
const admin = db.prepare("SELECT userName FROM users WHERE isAdmin=1").pluck().get();
if (admin == null) {
  console.log("WARNING: No administrator found. Add default administrator: admin/admin.");
  const admin_password_hash = bcrypt.hashSync("admin", 10);
  db.prepare("INSERT INTO users (userName, displayName, passwordHash, firstLogin, isAdmin) VALUES('admin', 'admin', ?, 1, 1)").run(admin_password_hash);
}

db.close();
console.log("Database is up to date.");
