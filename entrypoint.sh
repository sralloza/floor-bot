#!/bin/sh
set -e

if [ -z "${DATABASE_HOST}" ]; then
    echo "must set DATABASE_HOST"
    exit 1
fi
wait-for-it.sh "${DATABASE_HOST}:3306"

echo "creating database"
node ./createDatabase.js

echo "migrations before"
set +e
typeorm migration:show
set -e

echo "running migrations"
typeorm migration:run

echo "migrations after"
typeorm migration:show

echo "starting server"
node .
