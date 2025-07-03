"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useTRPC } from "@/trpc/client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  useQueryState,
  useQueryStates,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function TeachersPage() {
  const trpc = useTRPC();

  // Define URL state parameters with nuqs
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const [subject, setSubject] = useQueryState("subject", parseAsString);

  const [city, setCity] = useQueryState("city", parseAsString);

  // We'll handle minPrice and maxPrice separately since Slider needs an array
  const [minPrice, setMinPrice] = useQueryState(
    "minPrice",
    parseAsInteger.withDefault(0),
  );

  const [maxPrice, setMaxPrice] = useQueryState(
    "maxPrice",
    parseAsInteger.withDefault(5000),
  );

  // For teaching mode and sorting
  const [{ teachingMode, sortBy, sortOrder }, setFilters] = useQueryStates(
    {
      teachingMode: parseAsStringLiteral(["online", "offline"] as const),
      sortBy: parseAsStringLiteral([
        "rating",
        "experience",
        "price",
        "reviews",
      ] as const).withDefault("rating"),
      sortOrder: parseAsStringLiteral(["asc", "desc"] as const).withDefault(
        "desc",
      ),
    },
    { shallow: true },
  );

  // Derived state for the slider component
  const priceRange: [number, number] = [minPrice, maxPrice];

  const limit = 10;

  const subjectsQuery = useQuery(trpc.subjects.getMany.queryOptions());

  // Convert null values to undefined for the API call
  const teachersQuery = useQuery(
    trpc.teachers.getAll.queryOptions({
      page,
      limit,
      subject: subject || undefined,
      city: city || undefined,
      minPrice,
      maxPrice,
      teachingMode: teachingMode || undefined,
      sortBy: sortBy || "rating",
      sortOrder: sortOrder || "desc",
    }),
  );

  const subjectsData = subjectsQuery.data;
  const teachersData = teachersQuery.data;
  const isLoading = teachersQuery.isLoading;

  // Handle the price slider changes
  const handlePriceChange = useCallback(
    (value: number[]) => {
      if (value.length === 2) {
        setMinPrice(value[0]);
        setMaxPrice(value[1]);
      }
    },
    [setMinPrice, setMaxPrice],
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    // Force explicit URL parameter reset
    setSubject(null, { shallow: false });
    setCity(null, { shallow: false });
    setMinPrice(0, { shallow: false });
    setMaxPrice(5000, { shallow: false });
    setFilters(
      {
        teachingMode: null,
        sortBy: "rating",
        sortOrder: "desc",
      },
      { shallow: false },
    );
    setPage(1, { shallow: false });
  }, [setSubject, setCity, setMinPrice, setMaxPrice, setFilters, setPage]);

  // Check URL params for subject ID from the home page - only apply once on initial load
  const searchParams = useSearchParams();
  const [initialSubjectApplied, setInitialSubjectApplied] = useState(false);

  useEffect(() => {
    const subjectFromURL = searchParams.get("subject");
    if (subjectFromURL && !subject && !initialSubjectApplied) {
      setSubject(subjectFromURL);
      setInitialSubjectApplied(true);
    }
  }, [searchParams, subject, setSubject, initialSubjectApplied]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8">
        <Breadcrumbs
          items={[{ label: "Teachers", href: "/teachers", isCurrent: true }]}
        />
        <h1 className="mb-8 text-3xl font-bold">Find Your Perfect Teacher</h1>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Filters Section */}
          <div className="space-y-4 md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Refine your search</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Select
                    value={subject || "all"}
                    onValueChange={(value) => {
                      // When selecting "all", explicitly set to null with shallow: false to update URL
                      if (value === "all") {
                        setSubject(null, { shallow: false });
                      } else {
                        setSubject(value);
                      }
                    }}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjectsData?.docs.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    City
                  </label>
                  <Input
                    id="city"
                    value={city || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCity(value || null);
                    }}
                    placeholder="Enter city"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="price-range" className="text-sm font-medium">
                    Price Range: {priceRange[0]} - {priceRange[1]} UAH
                  </label>
                  <Slider
                    id="price-range"
                    min={0}
                    max={5000}
                    step={100}
                    value={priceRange}
                    onValueChange={handlePriceChange}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="teaching-mode"
                    className="text-sm font-medium"
                  >
                    Teaching Mode
                  </label>
                  <Select
                    value={teachingMode || "all"}
                    onValueChange={(value) =>
                      setFilters({
                        teachingMode:
                          value === "all"
                            ? null
                            : (value as "online" | "offline"),
                      })
                    }
                  >
                    <SelectTrigger id="teaching-mode">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="sort-by" className="text-sm font-medium">
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    <Select
                      value={sortBy}
                      onValueChange={(
                        value: "rating" | "experience" | "price" | "reviews",
                      ) => setFilters({ sortBy: value })}
                    >
                      <SelectTrigger id="sort-by">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="experience">Experience</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="reviews">Reviews</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={sortOrder}
                      onValueChange={(value: "asc" | "desc") =>
                        setFilters({ sortOrder: value })
                      }
                    >
                      <SelectTrigger id="sort-order">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Teachers List */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="border-primary h-12 w-12 animate-spin rounded-full border-t-2 border-b-2"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {teachersData?.docs.map((teacher) => (
                    <Card key={teacher.id} className="flex h-full flex-col">
                      <CardHeader>
                        <CardTitle>
                          {typeof teacher.user === "object"
                            ? teacher.user?.name
                            : "Teacher"}
                        </CardTitle>
                        <CardDescription>
                          {teacher.subjects
                            ?.map((s: any) => s.subject.name)
                            .join(", ")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="space-y-2">
                          <p className="text-muted-foreground text-sm">
                            <span className="font-medium">City:</span>{" "}
                            {teacher.city || "Not specified"}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            <span className="font-medium">Teaching Mode:</span>{" "}
                            {teacher.teachingMode?.join(", ") ||
                              "Not specified"}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            <span className="font-medium">Hourly Rate:</span>{" "}
                            {teacher.hourlyRate} UAH
                          </p>
                          <p className="text-muted-foreground text-sm">
                            <span className="font-medium">Rating:</span>{" "}
                            {teacher.averageRating && teacher.totalReviews
                              ? `${teacher.averageRating.toFixed(1)}/5 (${teacher.totalReviews} reviews)`
                              : "No ratings yet"}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col gap-2">
                        <Link
                          href={`/teachers/${teacher.id}`}
                          className="w-full"
                        >
                          <Button className="w-full">View Profile</Button>
                        </Link>
                        <Link
                          href={`/teachers/debug/${teacher.id}`}
                          className="w-full"
                        >
                          <Button variant="outline" className="w-full text-xs">
                            Debug Data
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {teachersData && teachersData.totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(Math.max(page - 1, 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>

                    <span className="flex items-center px-4">
                      Page {page} of {teachersData.totalPages}
                    </span>

                    <Button
                      variant="outline"
                      onClick={() =>
                        setPage(Math.min(page + 1, teachersData.totalPages))
                      }
                      disabled={page === teachersData.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
