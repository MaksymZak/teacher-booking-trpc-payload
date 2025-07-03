"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function TeacherDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const trpc = useTRPC();
  const teacherQuery = useQuery(
    trpc.teachers.getById.queryOptions(id as string),
  );
  const reviewsQuery = useQuery(
    trpc.teachers.getReviews.queryOptions({
      teacherId: id as string,
      page: 1,
      limit: 10,
    }),
  );

  const teacher = teacherQuery.data;
  const teacherReviews = reviewsQuery.data;
  const isLoading = teacherQuery.isLoading;

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
  console.log(teacher);
  return (
    <div className="container mx-auto py-8">
      <Breadcrumbs
        items={[
          { label: "Teachers", href: "/teachers", isCurrent: false },
          {
            label: "Teacher Details",
            href: `/teachers/${id}`,
            isCurrent: true,
          },
        ]}
      />
      <Button
        variant="outline"
        onClick={() => router.push("/teachers")}
        className="mr-2 mb-6"
      >
        ← Back to Teachers
      </Button>
      <Button
        variant="outline"
        onClick={() => router.push(`/teachers/debug/${id}`)}
        className="mb-6"
      >
        Debug View
      </Button>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Teacher Profile Card */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarFallback>
                    {typeof teacher.user === "object" && teacher.user?.name
                      ? teacher.user.name.substring(0, 2).toUpperCase()
                      : "TP"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>
                {typeof teacher.user === "object"
                  ? teacher.user?.name || "Teacher"
                  : "Teacher"}
              </CardTitle>
              <CardDescription>
                {teacher.subjects?.map((s: any) => s.subject.name).join(", ")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">Contact Information</h3>
                {typeof teacher.user === "object" && (
                  <>
                    <p className="text-sm">Email: {teacher.user.email}</p>
                    {teacher.user.phone && (
                      <p className="text-sm">Phone: {teacher.user.phone}</p>
                    )}
                  </>
                )}
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Teaching Details</h3>
                <p className="text-sm">
                  City: {teacher.city || "Not specified"}
                </p>
                <p className="text-sm">
                  Teaching Mode:{" "}
                  {teacher.teachingMode?.join(", ") || "Not specified"}
                </p>
                <p className="text-sm">Hourly Rate: {teacher.hourlyRate} UAH</p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Subjects</h3>
                <div className="flex flex-wrap gap-2">
                  {teacher.subjects?.map((subject: any) => (
                    <Badge key={subject.subject.id} variant="secondary">
                      {subject.subject.name}
                      {subject.experienceYears > 0 &&
                        ` (${subject.experienceYears} years)`}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full">Book a Lesson</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teacher Details and Reviews */}
        <div className="md:col-span-2">
          <Tabs defaultValue="about">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    About{" "}
                    {typeof teacher.user === "object"
                      ? teacher.user?.name || "Teacher"
                      : "Teacher"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-cyan prose-h1:text-cyan-600 max-w-none">
                    {teacher.biography ? (
                      <RichText data={teacher.biography} />
                    ) : (
                      <p>No biography provided.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Education & Qualifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Check if we have any education data from the teacher profile */}
                  <p>No education information provided.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Student Reviews</CardTitle>
                  <CardDescription>
                    {teacher.averageRating && teacher.totalReviews ? (
                      <div className="flex items-center gap-2">
                        <span className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(teacher.averageRating || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </span>
                        <span>
                          {(teacher.averageRating || 0).toFixed(1)} out of 5
                        </span>
                        <span>({teacher.totalReviews} reviews)</span>
                      </div>
                    ) : (
                      "No ratings yet"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {teacherReviews && teacherReviews.docs.length > 0 ? (
                    <div className="space-y-6">
                      {teacherReviews.docs.map((review: any) => (
                        <div
                          key={review.id}
                          className="border-b pb-6 last:border-0 last:pb-0"
                        >
                          <div className="mb-3 flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {review.student?.name
                                  ?.substring(0, 2)
                                  .toUpperCase() || "ST"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {review.student?.name || "Anonymous"}
                              </p>
                              <div className="flex items-center">
                                <span className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </span>
                                <span className="text-muted-foreground ml-2 text-xs">
                                  {new Date(
                                    review.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm">
                            {review.comment || "No comment provided."}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground py-8 text-center">
                      No reviews yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
