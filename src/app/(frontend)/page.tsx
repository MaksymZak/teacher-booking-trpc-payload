import { headers as getHeaders } from "next/headers.js";
import { getPayload } from "payload";
import React from "react";
import Link from "next/link";

import config from "@/payload.config";
import "./styles.css";
import { Button } from "@/components/ui/button";
import { getQueryClient, trpc } from "@/trpc/server";
import { Navbar } from "@/components/Navbar";

export default async function HomePage() {
  const headers = await getHeaders();
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });
  const { user } = await payload.auth({ headers });

  const queryClient = getQueryClient();
  const subjects = await queryClient.fetchQuery(
    trpc.subjects.getMany.queryOptions(),
  );

  // Group subjects by category
  const subjectsByCategory = subjects.docs.reduce(
    (acc: { [key: string]: any[] }, subject: any) => {
      const category = subject.category || "other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(subject);
      return acc;
    },
    {},
  );

  // Get unique categories
  const categories = Object.keys(subjectsByCategory);

  return (
    <div className="container mx-auto">
      <Navbar />

      <div className="py-8">
        <h2 className="mb-8 text-2xl font-semibold">
          Browse Subjects by Category
        </h2>

        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h3 className="mb-4 text-xl font-semibold capitalize">
              {category}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjectsByCategory[category].map((subject: any) => (
                <div
                  key={subject.id}
                  className="rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <h4 className="text-lg font-semibold">{subject.name}</h4>
                  {subject.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {subject.description}
                    </p>
                  )}
                  <Link
                    href={`/subjects?category=${category}`}
                    className="mt-3 inline-block text-sm text-purple-600 hover:underline"
                  >
                    View all {category} subjects →
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-4 text-right">
              <Link
                href={`/subjects?category=${category}`}
                className="font-medium text-purple-600 hover:underline"
              >
                View all in {category} →
              </Link>
            </div>
          </div>
        ))}

        <div className="mt-8 text-center">
          <Link href="/subjects">
            <Button variant="default" size="lg">
              Browse All Subjects
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
