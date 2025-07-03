import { getPayloadClient } from "@/db/client";

interface TeacherProfile {
  user: string;
  city: string;
  teachingMode: ("online" | "offline")[];
  hourlyRate: number;
  subjects: {
    subject: string;
    description: string;
    experienceLevel: "beginner" | "intermediate" | "advanced" | "expert";
  }[];
  yearsOfExperience: number;
  isVerified: boolean;
  isActive: boolean;
}

export const seedTeacherProfiles = async (
  teacherUserIds: string[],
  subjectIds: string[],
) => {
  const payload = await getPayloadClient();

  console.log("👨‍🏫 Creating teacher profiles...");

  // Helper function to create a teacher profile after checking if it exists
  const createTeacherProfileIfNotExists = async (
    profileData: TeacherProfile,
  ) => {
    try {
      // Check if profile for this user already exists
      const existingProfiles = await payload.find({
        collection: "teacher-profiles",
        where: {
          user: {
            equals: profileData.user,
          },
        },
      });

      if (existingProfiles.docs.length > 0) {
        console.log(
          `⚠️ Teacher profile for user ID ${profileData.user} already exists, using existing profile.`,
        );
        return existingProfiles.docs[0];
      }

      // Create profile if it doesn't exist
      return await payload.create({
        collection: "teacher-profiles",
        data: profileData,
      });
    } catch (error) {
      console.error(
        `❌ Error creating teacher profile for user ID ${profileData.user}:`,
        error,
      );
      throw error;
    }
  };

  const teacherProfiles: TeacherProfile[] = [
    {
      user: teacherUserIds[0],
      city: "Kyiv",
      teachingMode: ["online", "offline"],
      hourlyRate: 300,
      subjects: [
        {
          subject: subjectIds[0], // Mathematics
          description:
            "I focus on making math concepts clear and relatable, with a strong emphasis on problem-solving skills.",
          experienceLevel: "expert",
        },
        {
          subject: subjectIds[6], // Computer Science
          description:
            "I teach programming fundamentals, algorithms, and data structures with practical examples.",
          experienceLevel: "intermediate",
        },
      ],
      yearsOfExperience: 8,

      isVerified: true,
      isActive: true,
    },
    {
      user: teacherUserIds[1],
      city: "Lviv",
      teachingMode: ["online"],
      hourlyRate: 350,
      subjects: [
        {
          subject: subjectIds[1], // Physics
          description:
            "I specialize in making complex physics concepts accessible through demonstrations and practical examples.",
          experienceLevel: "advanced",
        },
        {
          subject: subjectIds[2], // Chemistry
          description:
            "My chemistry lessons incorporate visual experiments and real-world applications.",
          experienceLevel: "intermediate",
        },
      ],
      yearsOfExperience: 10,

      isVerified: true,
      isActive: true,
    },
    {
      user: teacherUserIds[2],
      city: "Odesa",
      teachingMode: ["online", "offline"],
      hourlyRate: 280,
      subjects: [
        {
          subject: subjectIds[4], // English
          description:
            "I focus on conversational fluency and practical language skills, with personalized feedback.",
          experienceLevel: "expert",
        },
        {
          subject: subjectIds[5], // Ukrainian
          description:
            "My Ukrainian language lessons include literature, culture, and practical communication skills.",
          experienceLevel: "advanced",
        },
      ],
      yearsOfExperience: 7,

      isVerified: true,
      isActive: true,
    },
    {
      user: teacherUserIds[3],
      city: "Kharkiv",
      teachingMode: ["online"],
      hourlyRate: 320,
      subjects: [
        {
          subject: subjectIds[7], // Web Development
          description:
            "I teach modern web development technologies with hands-on projects and real-world applications.",
          experienceLevel: "expert",
        },
        {
          subject: subjectIds[6], // Computer Science
          description:
            "My computer science lessons focus on algorithmic thinking and problem-solving strategies.",
          experienceLevel: "advanced",
        },
      ],
      yearsOfExperience: 6,

      isVerified: true,
      isActive: true,
    },
    {
      user: teacherUserIds[4],
      city: "Dnipro",
      teachingMode: ["offline"],
      hourlyRate: 270,
      subjects: [
        {
          subject: subjectIds[8], // Art
          description:
            "I teach various artistic techniques and foster creative expression in a supportive environment.",
          experienceLevel: "expert",
        },
        {
          subject: subjectIds[9], // Music
          description:
            "My music lessons cover theory, composition, and performance with personalized guidance.",
          experienceLevel: "intermediate",
        },
      ],
      yearsOfExperience: 9,

      isVerified: true,
      isActive: true,
    },
  ];

  for (const profile of teacherProfiles) {
    await createTeacherProfileIfNotExists(profile);
  }

  console.log(`✅ Created or found ${teacherProfiles.length} teacher profiles`);
};
