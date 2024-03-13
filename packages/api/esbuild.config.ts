import { buildSync } from "esbuild";

buildSync({
  entryPoints: ["./src/index.ts"],
  format: "esm",
  target: "es2022",
  platform: "node",
  //   minify: true,
  bundle: true,
  outdir: "dist",
  loader: {
    ".node": "file",
  },
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);
    const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
    const __dirname = (await import("node:path")).dirname(__filename)`,
  },
});
