// Production deploy (Workers Builds "Deploy command" for the main branch):
//   1. safety check of migrations (additive only, applied files unchanged)
//   2. log a D1 Time Travel bookmark (point-in-time restore target if anything goes wrong)
//   3. apply pending migrations to the production database (only new files; tracked in d1_migrations)
//   4. deploy the Worker
// Any failure stops the deploy before the new code goes live. Seeds are never run here.

import { execSync } from "node:child_process";

const run = (cmd, { optional = false } = {}) => {
  console.log(`\n$ ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (e) {
    if (optional) console.warn(`(continuing: "${cmd}" failed)`);
    else {
      console.error(`\nDeploy stopped: "${cmd}" failed. Production is unchanged.`);
      process.exit(1);
    }
  }
};

run("node scripts/check-migrations.mjs");
run("npx wrangler d1 time-travel info verdi-db", { optional: true });
run("npx wrangler d1 migrations apply verdi-db --remote");
run("npx wrangler deploy");
console.log("\nDeployed. Database migrations are up to date.");
