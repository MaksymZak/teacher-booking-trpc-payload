import { getPayloadClient } from "@/db/client";

// Simple slugify function (should match the one in the collection config)
function slugify(str: string): string {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-");
}

// Define interface for subject data
interface SubjectData {
  name: string;
  slug: string;
  description: string;
  category:
    | "mathematics"
    | "sciences"
    | "languages"
    | "technology"
    | "arts"
    | "other";
  isActive: boolean;
}

export const seedSubjects = async () => {
  const payload = await getPayloadClient();

  console.log("📚 Creating subjects...");

  // Helper function to create a subject after checking if it exists
  const createSubjectIfNotExists = async (subjectData: SubjectData) => {
    try {
      // Check if subject with this name already exists
      const existingSubjects = await payload.find({
        collection: "subjects",
        where: {
          name: {
            equals: subjectData.name,
          },
        },
      });

      if (existingSubjects.docs.length > 0) {
        console.log(
          `⚠️ Subject with name "${subjectData.name}" already exists, using existing subject.`,
        );
        return existingSubjects.docs[0];
      }

      // Debug: Log the exact data being sent to Payload
      console.log(
        `Creating subject with data:`,
        JSON.stringify(subjectData, null, 2),
      );

      // Create subject if it doesn't exist
      return await payload.create({
        collection: "subjects",
        data: subjectData,
      });
    } catch (error) {
      console.error(`❌ Error creating subject "${subjectData.name}":`, error);

      // Add more detailed error logging
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);

        // Check if it's a validation error and has specific field information
        if (
          "data" in error &&
          typeof error.data === "object" &&
          error.data !== null &&
          "errors" in error.data
        ) {
          console.error(
            `Validation errors:`,
            JSON.stringify(error.data.errors, null, 2),
          );
        }
      }

      throw error;
    }
  };

  const subjectData: SubjectData[] = [
    {
      name: "Mathematics",
      slug: slugify("Mathematics"),
      description:
        "Learn mathematical concepts from basic arithmetic to advanced calculus",
      category: "mathematics",
      isActive: true,
    },
    {
      name: "Physics",
      slug: slugify("Physics"),
      description:
        "Study the fundamental laws that govern the universe, from mechanics to quantum physics",
      category: "sciences",
      isActive: true,
    },
    {
      name: "Chemistry",
      slug: slugify("Chemistry"),
      description:
        "Explore the composition, structure, and properties of matter and the changes it undergoes",
      category: "sciences",
      isActive: true,
    },
    {
      name: "Biology",
      slug: slugify("Biology"),
      description:
        "Study living organisms and their interactions with each other and the environment",
      category: "sciences",
      isActive: true,
    },
    {
      name: "English",
      slug: slugify("English"),
      description:
        "Develop language skills including reading, writing, speaking, and listening in English",
      category: "languages",
      isActive: true,
    },
    {
      name: "Ukrainian",
      slug: slugify("Ukrainian"),
      description:
        "Learn Ukrainian language, literature, and culture for all proficiency levels",
      category: "languages",
      isActive: true,
    },
    {
      name: "French",
      slug: slugify("French"),
      description:
        "Master French language skills from beginner to advanced levels, including conversation, grammar, and culture",
      category: "languages",
      isActive: true,
    },
    {
      name: "German",
      slug: slugify("German"),
      description:
        "Learn German language fundamentals, conversation skills, and cultural insights for personal and professional growth",
      category: "languages",
      isActive: true,
    },
    {
      name: "Spanish",
      slug: slugify("Spanish"),
      description:
        "Develop Spanish language proficiency with focus on practical communication, grammar, and Hispanic cultures",
      category: "languages",
      isActive: true,
    },
    {
      name: "Chinese",
      slug: slugify("Chinese"),
      description:
        "Learn Mandarin Chinese characters, pronunciation, conversation skills, and cultural context",
      category: "languages",
      isActive: true,
    },
    {
      name: "Computer Science",
      slug: slugify("Computer Science"),
      description:
        "Study programming, algorithms, data structures, and computational systems",
      category: "technology",
      isActive: true,
    },
    {
      name: "Web Development",
      slug: slugify("Web Development"),
      description:
        "Learn to build websites and web applications using HTML, CSS, JavaScript and modern frameworks",
      category: "technology",
      isActive: true,
    },
    {
      name: "Mobile App Development",
      slug: slugify("Mobile App Development"),
      description:
        "Create mobile applications for iOS and Android platforms using React Native, Swift, or Kotlin",
      category: "technology",
      isActive: true,
    },
    {
      name: "Data Science",
      slug: slugify("Data Science"),
      description:
        "Learn to analyze and interpret complex data using statistical methods, machine learning, and programming",
      category: "technology",
      isActive: true,
    },
    {
      name: "Cybersecurity",
      slug: slugify("Cybersecurity"),
      description:
        "Understand network security, ethical hacking, threat analysis, and security best practices",
      category: "technology",
      isActive: true,
    },
    {
      name: "Art",
      slug: slugify("Art"),
      description:
        "Develop artistic skills and creative expression through various mediums",
      category: "arts",
      isActive: true,
    },
    {
      name: "Music",
      slug: slugify("Music"),
      description:
        "Study music theory, composition, and performance on various instruments",
      category: "arts",
      isActive: true,
    },
    {
      name: "Photography",
      slug: slugify("Photography"),
      description:
        "Master the technical and artistic aspects of photography, from camera basics to advanced composition",
      category: "arts",
      isActive: true,
    },
    {
      name: "Dance",
      slug: slugify("Dance"),
      description:
        "Learn various dance styles, techniques, and choreography for all experience levels",
      category: "arts",
      isActive: true,
    },
    {
      name: "History",
      slug: slugify("History"),
      description:
        "Explore historical events, figures, and movements from ancient civilizations to modern times",
      category: "other",
      isActive: true,
    },
    {
      name: "Geography",
      slug: slugify("Geography"),
      description:
        "Study physical features of the Earth, human societies, and the relationships between them",
      category: "other",
      isActive: true,
    },
    {
      name: "Economics",
      slug: slugify("Economics"),
      description:
        "Understand economic principles, market dynamics, financial systems, and global economies",
      category: "other",
      isActive: true,
    },
  ];

  const subjects = [];
  for (const subject of subjectData) {
    const createdSubject = await createSubjectIfNotExists(subject);
    subjects.push(createdSubject);
  }

  console.log(`✅ Created or found ${subjects.length} subjects`);
  return subjects;
};
