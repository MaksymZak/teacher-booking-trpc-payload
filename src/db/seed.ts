import fs from "fs";
import path from "path";
import { env } from "@/config/env";
import { seedUsers } from "@/db/seeders/users";
import { exit } from "process";

export async function seedDatabase() {
  await clearDatabase();
  await seedUsers();
  console.log("🌱 Database seeded successfully");
  exit(0);
}

async function clearDatabase() {
  console.log(
    "🗑️  Clearing database...",
    env.DATABASE_URI.replace("file:", ""),
  );

  // Delete the SQLite database file completely
  const dbPath = path.resolve(
    process.cwd(),
    env.DATABASE_URI.replace("file:", ""),
  );

  try {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log("✅ Database file deleted");
    }
  } catch (error) {
    console.log("⚠️  Could not delete database file:", error);
  }
}

seedDatabase();
