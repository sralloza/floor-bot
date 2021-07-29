#!/bin/sh
set -e

export REDIS_HOST=${REDIS_HOST:=redis}
export REDIS_PORT=${REDIS_PORT:=6379}

# This script exists just in case it's needed in the future.
# Be aware of EOL=LF.

/usr/sbin/wait-for-it.sh $REDIS_HOST:$REDIS_PORT

node .
