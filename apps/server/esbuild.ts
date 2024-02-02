import { build } from "esbuild";
import glob from "tiny-glob";

(async function () {
  // Get all ts files
  const entryPoints = await glob("src/**/*.ts");

  build({
    entryPoints,
    logLevel: "info",
    outdir: "build",
    bundle: true,
    minify: true,
    platform: "node",
    format: "cjs",
    sourcemap: true,
  });
})();
