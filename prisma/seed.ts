import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://samsara:samsara_password@localhost:5432/samsara?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const email = process.env.SEED_USER_EMAIL ?? "you@example.com";
  const displayName = process.env.SEED_USER_NAME ?? "Samsara Owner";
  const password =
    process.env.SEED_USER_PASSWORD ??
    process.env.AUTH_PASSWORD ??
    "samsara-dev-password";
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    create: {
      displayName,
      email,
      passwordHash,
      role: "OWNER",
    },
    update: {
      displayName,
      passwordHash,
      role: "OWNER",
    },
    where: { email },
  });

  const settings = [
    { key: "theme.mode", valueJson: { mode: "light" } },
    { key: "dashboard.layout", valueJson: { density: "comfortable" } },
    { key: "storage.provider", valueJson: { provider: "local" } },
    { key: "ai.enabled", valueJson: { enabled: false } },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      create: {
        ...setting,
        scope: "USER",
        userId: user.id,
      },
      update: setting,
      where: {
        userId_key: {
          key: setting.key,
          userId: user.id,
        },
      },
    });
  }

  const tags = [
    { color: "#2563eb", name: "Personal", type: "GLOBAL" },
    { color: "#16a34a", name: "Work", type: "GLOBAL" },
    { color: "#9333ea", name: "Learning", type: "GLOBAL" },
    { color: "#ea580c", name: "Important", type: "TODO" },
  ] as const;

  for (const tag of tags) {
    await prisma.tag.upsert({
      create: {
        ...tag,
        userId: user.id,
      },
      update: {
        color: tag.color,
      },
      where: {
        userId_name_type: {
          name: tag.name,
          type: tag.type,
          userId: user.id,
        },
      },
    });
  }

  const existingHistory = await prisma.aIHistory.count({
    where: {
      intent: "CHAT",
      module: "DASHBOARD",
      userId: user.id,
    },
  });

  if (existingHistory === 0) {
    await prisma.aIHistory.create({
      data: {
        inputJson: { message: "Initialize Samsara AI history boundary." },
        module: "DASHBOARD",
        outputJson: { message: "AI Workbench is available in v1.0." },
        status: "COMPLETED",
        intent: "CHAT",
        userId: user.id,
      },
    });
  }

  console.log(`Seeded Samsara owner: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
