import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  UserRole,
} from '../src/generated/prisma/client.js';

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not defined.`);
  }

  return value;
}

const databaseUrl = getRequiredEnv('DATABASE_URL');
const adminEmail = getRequiredEnv('SEED_ADMIN_EMAIL');
const adminPassword = getRequiredEnv('SEED_ADMIN_PASSWORD');

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const passwordHash = await argon2.hash(adminPassword);

  const user = await prisma.user.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'Structa',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log(`SUPER_ADMIN ready: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });