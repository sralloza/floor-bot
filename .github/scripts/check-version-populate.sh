#!/usr/bin/env bash

set -eo pipefail

officialVersion=$(cat package.json | jq -r '.version')
lockVersion1=$(cat package-lock.json | jq -r '.version')
lockVersion2=$(cat package-lock.json | jq -r '.packages | .[] | select(.name == "floor-bot") | .version')

if [ "$officialVersion" != "$lockVersion1" ]; then
  # XXX: show the error message in PR status instead of log
  echo "::error file=package-lock.json::Must update package-lock.json main version too, use 'npm install'."
  exit 1
fi

if [ "$officialVersion" != "$lockVersion2" ]; then
  # XXX: show the error message in PR status instead of log
  echo "::error file=package-lock.json::Must update package-lock.json dependency version too, use 'npm install'."
  exit 1
fi
