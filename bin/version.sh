#!/bin/bash

set -e

MANIFEST_PATH="package.json"

if ! [ -f "$MANIFEST_PATH" ]; then
  echo "❌ Manifest file not found: $MANIFEST_PATH"
  exit 1
fi

VERSION=$(jq -r '.version' "$MANIFEST_PATH")

echo "v$VERSION"