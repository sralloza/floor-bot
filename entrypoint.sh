#!/bin/sh
set -e
# This script exists just in case it's needed in the future.
# Be aware of EOL=LF.

if [ -z "$1" ]; then
  echo "No argument supplied. To launch server, set the first argument to 'server'"
  exit 1
fi

if [ "$1" = "server" ]; then
  node --unhandled-rejections=strict .
  exit 0
fi

echo "Received '$1', assuming it's a cron"

nodeCmd="
const jobsLoader = require(\"./build/src/loaders/jobsLoader\").default
const cronScripts = require(\"./build/src/cronScripts\")
const Logger = require(\"./build/src/loaders/logger\").default

jobsLoader().then(() => {
    Logger.info(\"Launching script\");
    cronScripts.$1Job().then(() => process.exit());
  }
);
"

echo "launching: $nodeCmd"
node --unhandled-rejections=strict -e "$nodeCmd"
echo "Done"
exit 0
