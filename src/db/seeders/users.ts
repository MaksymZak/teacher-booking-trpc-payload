import { getPayloadClient } from "@/db/client";

// Define interface for user data
interface UserData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "admin" | "teacher" | "student";
  isActive: boolean;
}

export const seedUsers = async () => {
  const payload = await getPayloadClient();

  console.log("👤 Creating users...");

  // Helper function to create a user after checking if it exists
  const createUserIfNotExists = async (userData: UserData) => {
    try {
      // Check if user with this email already exists
      const existingUsers = await payload.find({
        collection: "users",
        where: {
          email: {
            equals: userData.email,
          },
        },
      });

      if (existingUsers.docs.length > 0) {
        console.log(
          `⚠️ User with email ${userData.email} already exists, using existing user.`,
        );
        return existingUsers.docs[0];
      }

      // Create user if it doesn't exist
      return await payload.create({
        collection: "users",
        data: userData,
      });
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error);
      throw error;
    }
  };

  // Create the admin user
  const admin = await createUserIfNotExists({
    name: "Maks",
    email: "test@gmail.com",
    password: "123456",
    phone: "+380501112233",
    role: "admin" as const,
    isActive: true,
  });

  console.log("✅ Admin user created or found: test@gmail.com");
  // Create student users
  const studentData = [
    {
      name: "Anna Kovalenko",
      email: "anna.kovalenko@example.com",
      password: "password123",
      phone: "+380661234567",
      role: "student" as const,
      isActive: true,
    },
    {
      name: "Oleksandr Petrov",
      email: "oleksandr.petrov@example.com",
      password: "password123",
      phone: "+380672345678",
      role: "student" as const,
      isActive: true,
    },
    {
      name: "Natalia Shevchenko",
      email: "natalia.shevchenko@example.com",
      password: "password123",
      phone: "+380683456789",
      role: "student" as const,
      isActive: true,
    },
    {
      name: "Mykhailo Bondarenko",
      email: "mykhailo.bondarenko@example.com",
      password: "password123",
      phone: "+380694567890",
      role: "student" as const,
      isActive: true,
    },
    {
      name: "Viktoria Tkachenko",
      email: "viktoria.tkachenko@example.com",
      password: "password123",
      phone: "+380705678901",
      role: "student" as const,
      isActive: true,
    },
  ];

  const students = [];
  for (const student of studentData) {
    const createdStudent = await createUserIfNotExists(student);
    students.push(createdStudent);
  }

  console.log(`✅ Created or found ${students.length} student users`);

  // Create teacher users
  const teacherData = [
    {
      name: "Iryna Melnyk",
      email: "iryna.melnyk@example.com",
      password: "password123",
      phone: "+380967890123",
      role: "teacher" as const,
      isActive: true,
    },
    {
      name: "Dmytro Kravchuk",
      email: "dmytro.kravchuk@example.com",
      password: "password123",
      phone: "+380978901234",
      role: "teacher" as const,
      isActive: true,
    },
    {
      name: "Olena Lysenko",
      email: "olena.lysenko@example.com",
      password: "password123",
      phone: "+380989012345",
      role: "teacher" as const,
      isActive: true,
    },
    {
      name: "Taras Boyko",
      email: "taras.boyko@example.com",
      password: "password123",
      phone: "+380990123456",
      role: "teacher" as const,
      isActive: true,
    },
    {
      name: "Svitlana Kravets",
      email: "svitlana.kravets@example.com",
      password: "password123",
      phone: "+380501234567",
      role: "teacher" as const,
      isActive: true,
    },
  ];

  const teachers = [];
  for (const teacher of teacherData) {
    const createdTeacher = await createUserIfNotExists(teacher);
    teachers.push(createdTeacher);
  }

  console.log(`✅ Created or found ${teachers.length} teacher users`);

  console.log("🌱 Users seeded successfully");

  // Return created users for other seeders to use
  return {
    admin,
    students,
    teachers,
  };
};
