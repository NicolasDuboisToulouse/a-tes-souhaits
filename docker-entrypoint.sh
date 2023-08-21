#!/bin/sh

export HOSTNAME=127.0.0.1

echo "Update database then run app..."
set -x
node database/update_database.js || exit 1
exec node server.js
