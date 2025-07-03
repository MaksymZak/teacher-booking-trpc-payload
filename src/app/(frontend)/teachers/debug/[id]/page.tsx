"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/trpc/client";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export default function TeacherDebugPage() {
  const { id } = useParams();
  const router = useRouter();

  const trpc = useTRPC();
  const teacherQuery = useQuery(
    trpc.teachers.getById.queryOptions(id as string),
  );
  const subjectsQuery = useQuery(trpc.subjects.getMany.queryOptions());

  const teacher = teacherQuery.data;
  const subjects = subjectsQuery.data;
  const isLoading = teacherQuery.isLoading || subjectsQuery.isLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center py-8">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-t-2 border-b-2"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="mb-4 text-3xl font-bold">Teacher Not Found</h1>
        <p className="mb-8">
          The teacher you are looking for does not exist or has been removed.
        </p>
        <Button onClick={() => router.push("/teachers")}>
          Back to Teachers
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/teachers")}>
          ← Back to Teachers
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/teachers/${id}`)}
        >
          View Teacher Profile
        </Button>
      </div>

      <h1 className="mb-8 text-3xl font-bold">
        Teacher Debug View:{" "}
        {typeof teacher.user === "object" ? teacher.user?.name : "Teacher"}
      </h1>

      <Tabs defaultValue="teacher" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="teacher">Teacher Data</TabsTrigger>
          <TabsTrigger value="subjects">Subjects Data</TabsTrigger>
        </TabsList>

        <TabsContent value="teacher">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Raw Data</CardTitle>
              <CardDescription>
                Complete JSON data structure for this teacher
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-lg font-medium">Basic Info</h3>
                  <pre className="max-h-[20vh] overflow-auto rounded-md bg-slate-100 p-4 text-sm dark:bg-slate-800">
                    {JSON.stringify(
                      {
                        id: teacher.id,
                        user: teacher.user,
                        city: teacher.city,
                        teachingMode: teacher.teachingMode,
                        hourlyRate: teacher.hourlyRate,
                        isActive: teacher.isActive,
                        isVerified: teacher.isVerified,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-medium">Stats & Metrics</h3>
                  <pre className="max-h-[20vh] overflow-auto rounded-md bg-slate-100 p-4 text-sm dark:bg-slate-800">
                    {JSON.stringify(
                      {
                        averageRating: teacher.averageRating,
                        totalReviews: teacher.totalReviews,
                        yearsOfExperience: teacher.yearsOfExperience,
                        createdAt: teacher.createdAt,
                        updatedAt: teacher.updatedAt,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">Complete Data</h3>
                <pre className="max-h-[50vh] overflow-auto rounded-md bg-slate-100 p-4 text-sm dark:bg-slate-800">
                  {JSON.stringify(teacher, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle>Subjects Raw Data</CardTitle>
              <CardDescription>
                Complete JSON data for all subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="mb-2 text-lg font-medium">Teacher's Subjects</h3>
                <pre className="max-h-[30vh] overflow-auto rounded-md bg-slate-100 p-4 text-sm dark:bg-slate-800">
                  {JSON.stringify(teacher.subjects, null, 2)}
                </pre>
              </div>

              <div className="mb-4">
                <h3 className="mb-2 text-lg font-medium">Subject Stats</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-medium">
                      Teacher's Subject Count
                    </h4>
                    <div className="rounded-md bg-slate-100 p-4 dark:bg-slate-800">
                      <p className="text-2xl font-bold">
                        {teacher.subjects?.length || 0}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Total subjects taught
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium">Available Subjects</h4>
                    <div className="rounded-md bg-slate-100 p-4 dark:bg-slate-800">
                      <p className="text-2xl font-bold">
                        {subjects?.docs?.length || 0}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Total subjects in system
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">
                  All Available Subjects
                </h3>
                <pre className="max-h-[30vh] overflow-auto rounded-md bg-slate-100 p-4 text-sm dark:bg-slate-800">
                  {JSON.stringify(subjects, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
