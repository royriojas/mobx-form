#!/bin/bash

bunx dts-bundle \
--name mobx-form \
--baseDir dist \
--main dist/index.d.ts \
--out dist/mobx-form.d.ts \
--removeSource