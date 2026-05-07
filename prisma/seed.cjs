/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const { PrismaClient, UserRole } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL || "dragosnicolescu7@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "Qwerty00!";
  const fullName = process.env.ADMIN_FULL_NAME || "Dragos Nicolescu";
  const phone = process.env.ADMIN_PHONE || "0740150801";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      fullName,
      phoneNumber: phone,
      role: UserRole.ADMIN,
      passwordHash,
      phoneVerified: true,
    },
    create: {
      fullName,
      email,
      phoneNumber: phone,
      role: UserRole.ADMIN,
      passwordHash,
      phoneVerified: true,
    },
  });

  console.info(`Admin seed completed for ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
