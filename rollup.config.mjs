import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import replace from "@rollup/plugin-replace";
import copy from "rollup-plugin-copy";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------------------------------------------------
// 🤖 THE AUTOMATION (Kept exactly as is - this is gold)
// ----------------------------------------------------------------
const autoGasExports = () => {
  return {
    name: "auto-gas-exports",
    generateBundle(options, bundle) {
      const entryChunk = Object.values(bundle).find((chunk) => chunk.isEntry);
      if (!entryChunk) return;

      const libraryName = options.name;
      let footer = "\n/** 🤖 AUTO-GENERATED ENTRY POINTS */\n";
      footer += "var global = this;\n";

      entryChunk.exports.forEach((funcName) => {
        if (funcName === "default") return;
        footer += `function ${funcName}(...args) { return ${libraryName}.${funcName}.apply(global, args); }\n`;
      });

      entryChunk.code += footer;
    },
  };
};

export default () => {
  // 1. USE PROCESS.ENV (Matches your new package.json)
  const project = process.env.TARGET;
  const env = process.env.BUILD;

  if (!project || !env) {
    throw new Error("❌ Environment variables TARGET and BUILD are required.");
  }

  console.log(`\n🚀 Building Project: [ ${project} ]`);
  console.log(`🌍 Environment:      [ ${env.toUpperCase()} ]`);

  const projectRoot = path.join(__dirname, "packages", project);

  // 2. PATHS (Updated to match your folder structure)
  const inputPath = path.join(projectRoot, "src", "index.ts");
  const outputDir = path.join(projectRoot, "dist", env);

  // 3. CLASP & MANIFEST
  // Looks for 'clasp-live.json' in 'packages/project/'
  const claspConfigName = `clasp-${env}.json`;

  return {
    input: inputPath,
    output: {
      dir: outputDir,
      format: "iife",
      entryFileNames: "bundle.js", // Matches your package.json push command
      name: "GasBundle",
      extend: true,
    },
    plugins: [
      alias({
        entries: [
          {
            find: "@shared",
            replacement: path.join(__dirname, "packages/shared/src"),
          },
        ],
      }),
      copy({
        targets: [
          // Copy clasp-live.json -> dist/live/.clasp.json
          {
            src: path.join(projectRoot, claspConfigName),
            dest: outputDir,
            rename: ".clasp.json",
          },
          // Copy appsscript.json -> dist/live/appsscript.json
          {
            src: path.join(projectRoot, "appsscript.json"),
            dest: outputDir,
          },
        ],
        verbose: true,
      }),
      replace({
        preventAssignment: true,
        values: {
          "process.env.NODE_ENV": JSON.stringify(env),
          BUILD_TIMESTAMP: JSON.stringify(new Date().toISOString()),
        },
      }),
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      typescript({
        // Point to project config
        tsconfig: path.join(projectRoot, "tsconfig.json"),

        // ⚡️ THE FIX: Force TS to output to the current Rollup destination
        compilerOptions: {
          outDir: outputDir,
        },
      }),

      // ✅ RUN THE AUTOMATION
      autoGasExports(),
    ],
  };
};
