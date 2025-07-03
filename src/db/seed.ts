import fs from "fs";
import path from "path";
import { env } from "@/config/env";
import { seedUsers } from "@/db/seeders/users";
import { seedSubjects } from "@/db/seeders/subjects";
import { seedTeacherProfiles } from "@/db/seeders/teacherProfiles";
import { getPayloadClient } from "@/db/client";

export async function seedDatabase() {
  try {
    await clearDatabase();

    // Get payload client
    const payload = await getPayloadClient();

    // Seed users first to get IDs for teachers and students
    const { teachers: teacherUsers, students: studentUsers } =
      await seedUsers();

    // Extract IDs from created users
    const teacherIds = teacherUsers.map((teacher) => teacher.id);
    const studentIds = studentUsers.map((student) => student.id);

    // Seed subjects
    const subjects = await seedSubjects();
    const subjectIds = subjects.map((subject) => subject.id);

    // Seed teacher profiles
    await seedTeacherProfiles(teacherIds, subjectIds);

    console.log("🌱 Database seeded successfully");

    // Explicitly exit the process with success code
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    // Exit with error code
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log("🗑️  Clearing database...");

  try {
    // Try to get payload client
    const payload = await getPayloadClient();

    console.log("Attempting to drop all collections...");

    // MongoDB approach - directly access the database and drop collections
    if (payload.db && payload.db.connection) {
      try {
        // This is MongoDB-specific logic
        const collections = [
          "users",
          "teacher-profiles",
          "subjects",
          "reviews",
          "media",
          "payload-preferences",
          "payload-migrations",
        ];

        for (const collectionName of collections) {
          try {
            await payload.db.connection
              .collection(collectionName)
              .deleteMany({});
            console.log(`✅ Cleared collection: ${collectionName}`);
          } catch (err) {
            console.log(
              `⚠️ Could not clear collection ${collectionName}:`,
              err,
            );
          }
        }

        console.log("✅ Database cleared successfully");
      } catch (dbError) {
        console.log("⚠️ Error accessing database:", dbError);
      }
    } else {
      // SQLite approach - delete the file
      const dbPath = path.resolve(
        process.cwd(),
        env.DATABASE_URI.replace("file:", ""),
      );

      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log("✅ Database file deleted for a fresh start");
      }
    }
  } catch (error) {
    console.log("⚠️ Could not clear database:", error);

    // Fallback to file deletion for SQLite
    if (env.DATABASE_URI.includes("file:")) {
      const dbPath = path.resolve(
        process.cwd(),
        env.DATABASE_URI.replace("file:", ""),
      );

      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log("✅ Database file deleted as fallback");
      }
    }
  }
}

seedDatabase();
