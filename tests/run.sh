#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
for t in audit a11y xss sync fuzz; do echo "== $t"; node $t.js; done
