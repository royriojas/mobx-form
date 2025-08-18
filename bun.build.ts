const build = async () => {
  await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    naming: {
      entry: '[dir]/[name].cjs',
    },
    external: ["lodash", "mobx"],
    target: "browser",
    format: "cjs",
  });
  
  await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    naming: {
      entry: '[dir]/[name].js',
    },
    external: ["lodash", "mobx"],
    target: "browser",
    format: "esm",
  });
}

build().catch(err => console.error(err));