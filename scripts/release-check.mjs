import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";

const skipDb = process.argv.includes("--skip-db");

function run(command, args) {
  console.log(`\n$ ${[command, ...args].join(" ")}`);
  execFileSync(command, args, { stdio: "inherit" });
}

function hasCommand(command) {
  try {
    execFileSync("sh", ["-lc", `command -v ${command}`], { stdio: "ignore" });

    return true;
  } catch {
    return false;
  }
}

function isPortOpen(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });

    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

if (!existsSync(".env")) {
  throw new Error("Missing .env. Copy .env.example to .env before release checks.");
}

run("pnpm", ["db:validate"]);
run("pnpm", ["typecheck"]);
run("pnpm", ["lint"]);
run("pnpm", ["exec", "tsc", "--noEmit", "--noUnusedLocals", "--noUnusedParameters"]);
run("pnpm", ["build"]);

if (skipDb) {
  console.log("\nSkipped database E2E checks because --skip-db was provided.");
  process.exit(0);
}

const databaseReady = await isPortOpen(5432);

if (!databaseReady) {
  const hint = hasCommand("docker")
    ? "Run `pnpm db:up`, wait for PostgreSQL to become healthy, then rerun `pnpm release:check`."
    : "Install Docker or PostgreSQL, start a server on localhost:5432, then rerun `pnpm release:check`.";

  throw new Error(`PostgreSQL is not reachable on localhost:5432. ${hint}`);
}

run("pnpm", ["db:migrate"]);
run("pnpm", ["db:seed"]);

console.log("\nSamsara release check passed.");
