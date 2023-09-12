#!/bin/sh

export HOSTNAME=127.0.0.1

set -x
exec node server.js | npx pino-pretty
