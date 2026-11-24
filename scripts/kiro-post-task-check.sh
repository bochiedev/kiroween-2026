#!/bin/sh
set -eu
if [ ! -f package.json ]; then echo 'SKIP: package.json not created yet'; exit 0; fi
for script in typecheck test:unit; do
  if node -e "const s=require('./package.json').scripts||{};process.exit(Object.hasOwn(s, process.argv[1])?0:1)" "$script"; then
    echo "RUN: npm run $script"
    npm run "$script"
  else
    echo "SKIP: no npm script named $script"
  fi
done
