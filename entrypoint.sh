#!/bin/sh
set -e

export REDIS_HOST=${REDIS_HOST:=redis}
export REDIS_PORT=${REDIS_PORT:=6379}

# This script exists just in case it's needed in the future.
# Be aware of EOL=LF.

node --unhandled-rejections=strict .
