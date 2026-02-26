#!/bin/bash

bunx dts-bundle \
--name mobx-form \
--baseDir dist \
--main dist/index.d.ts \
--out mobx-form.d.ts \
--removeSource

# verify existance of mobx-form.d.ts
if [ -f "dist/mobx-form.d.ts" ]; then
  echo "mobx-form.d.ts exists"
else
  echo "mobx-form.d.ts does not exist"
  exit 1
fi