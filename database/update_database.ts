/*
 * Create or update database by executing files schemas/db_<version>.sql.
 * All db_<version>.sql needn't to exists but:
 *  - the first db_<version>.sql must create database <version>
 *  - next db_<version>.sql must upgrade database to <version>
 */
import * as sqlite3 from 'sqlite3';
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

// Open database
const db_path = path.join(__dirname, 'database.db');
console.log('Create or open database: ' + db_path);
sqlite3.verbose();
let db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_FULLMUTEX,
  (error: Error|null) => {
    if (error) return console.log(error);

    // Get datbase version
    db.get('PRAGMA user_version', [],
      function(error: Error, row: any) {
        if (error) return console.log(error);
        if (row.user_version == null) return console.log('Error: row.user_version expected. row:' + JSON.stringify(row));
        console.log('Current database version: ' + row.user_version + '.');

        // Update database to last version
        db.serialize(() => {
          if (row.user_version == 0) {
            db.run('PRAGMA foreign_keys=OFF');
          }
          for(let version = row.user_version + 1; version <= db_version; version++) {
            if (schemas.has(version)) {
              console.log('Update database to version ' + version + '...');
              db.run('BEGIN TRANSACTION');
              db.exec(schemas.get(version)!);
              db.run('PRAGMA user_version=' + version);
              db.run('COMMIT');
            }
          }
          db.close(function(error: Error|null) {
            if (error) return console.log(error);
            console.log("Database up to date.");
          });
        });
      });
  });

