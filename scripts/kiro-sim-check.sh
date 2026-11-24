#!/bin/sh
set -eu
if [ ! -f package.json ]; then echo 'SKIP: package.json not created yet'; exit 0; fi
if node -e "const s=require('./package.json').scripts||{};process.exit(Object.hasOwn(s, 'test:sim')?0:1)"; then
  echo 'RUN: npm run test:sim'
  npm run test:sim
else
  echo 'SKIP: no test:sim npm script yet'
fi
