#!/bin/bash

bunx dts-bundle \
--name mobx-form \
--baseDir dist \
--main dist/index.d.ts \
--out mobx-form.d.ts \
--removeSource

# verify existence of mobx-form.d.ts
if [ -f "dist/mobx-form.d.ts" ]; then
  echo "mobx-form.d.ts exists"
  cp dist/mobx-form.d.ts dist/mobx-form.d.mts
else
  echo "mobx-form.d.ts does not exist"
  exit 1
fi