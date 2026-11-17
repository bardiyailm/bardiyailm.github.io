#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
for t in audit a11y xss sync sync2 mind verify mindflow mindboard fuzz; do echo "== $t"; node $t.js; done
