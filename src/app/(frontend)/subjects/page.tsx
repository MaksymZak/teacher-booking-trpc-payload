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
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  useQueryState,
  useQueryStates,
  parseAsString,
  parseAsStringLiteral,
  parseAsInteger,
} from "nuqs";
import { useCallback, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function SubjectsPage() {
  // Use nuqs for URL state management
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ shallow: true }),
  );

  // Add page state for pagination
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const [{ category, sortBy, sortOrder, limit }, setFilterSort] =
    useQueryStates(
      {
        category: parseAsString,
        sortBy: parseAsStringLiteral([
          "name",
          "popularity",
        ] as const).withDefault("name"),
        sortOrder: parseAsStringLiteral(["asc", "desc"] as const).withDefault(
          "asc",
        ),
        limit: parseAsInteger.withDefault(9),
      },
      {
        shallow: true,
      },
    );

  const trpc = useTRPC();

  // Query subjects with all filters applied at the API level
  const subjectsQuery = useQuery(
    trpc.subjects.getMany.queryOptions({
      page,
      limit,
      search: search || undefined,
      category: category || undefined,
      sortBy,
      sortOrder,
    }),
  );

  const subjectsData = subjectsQuery.data;
  const isLoading = subjectsQuery.isLoading;

  // Extract pagination data from the response
  const totalPages = subjectsData?.totalPages || 1;
  const totalItems = subjectsData?.totalDocs || 0;
  const hasNextPage = subjectsData?.hasNextPage || false;
  const hasPrevPage = subjectsData?.hasPrevPage || false;

  // Handle search with debouncing
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // If we're clearing the search, update immediately
      if (value === "") {
        setSearch("");
      } else {
        // Otherwise, use a timeout to debounce
        const timeoutId = setTimeout(() => {
          setSearch(value);
        }, 500);

        // Cleanup on unmount or before next call
        return () => clearTimeout(timeoutId);
      }
    },
    [setSearch],
  );

  // Get unique categories for the filter
  const categoriesQuery = useQuery(
    trpc.subjects.getMany.queryOptions({
      page: 1,
      limit: 100, // Get all to extract categories
    }),
  );

  // Extract unique categories
  const categories =
    categoriesQuery.data?.docs
      ?.map((subject: any) => subject.category)
      .filter(Boolean)
      .filter(
        (category: string, index: number, self: string[]) =>
          self.indexOf(category) === index,
      ) || [];

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setFilterSort({
      category: null,
      sortBy: "name",
      sortOrder: "asc",
      limit: 9,
    });
    setPage(1);
  };

  // When category/sort/search changes, reset to page 1
  useEffect(() => {
    setPage(1);
  }, [search, category, sortBy, sortOrder, limit, setPage]);

  return (
    <div className="container mx-auto">
      <Navbar />

      <div className="py-8">
        <h1 className="mb-8 text-3xl font-bold">Subject Catalog</h1>

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
                  <label htmlFor="search" className="text-sm font-medium">
                    Search
                  </label>
                  <Input
                    id="search"
                    value={search || ""}
                    onChange={handleSearchChange}
                    placeholder="Search subjects"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  <Select
                    value={category || "all"}
                    onValueChange={(value) =>
                      setFilterSort({
                        category: value === "all" ? null : value,
                      })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((cat: string) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
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
                      onValueChange={(value: "name" | "popularity") =>
                        setFilterSort({ sortBy: value })
                      }
                    >
                      <SelectTrigger id="sort-by">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="popularity">Popularity</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={sortOrder}
                      onValueChange={(value: "asc" | "desc") =>
                        setFilterSort({ sortOrder: value })
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

                <div className="space-y-2">
                  <label
                    htmlFor="items-per-page"
                    className="text-sm font-medium"
                  >
                    Items Per Page
                  </label>
                  <Select
                    value={limit.toString()}
                    onValueChange={(value) =>
                      setFilterSort({ limit: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="items-per-page">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="9">9</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
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

          {/* Subjects List */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="border-primary h-12 w-12 animate-spin rounded-full border-t-2 border-b-2"></div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    Showing{" "}
                    <span className="font-medium">
                      {subjectsData?.docs.length || 0}
                    </span>{" "}
                    of <span className="font-medium">{totalItems}</span>{" "}
                    subjects
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {subjectsData?.docs.map((subject: any) => (
                    <Card key={subject.id} className="flex h-full flex-col">
                      <CardHeader>
                        <CardTitle>{subject.name}</CardTitle>
                        {subject.category && (
                          <CardDescription>{subject.category}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-muted-foreground mb-4 text-sm">
                          {subject.description?.length > 100
                            ? `${subject.description.substring(0, 100)}...`
                            : subject.description ||
                              "No description available."}
                        </p>
                        <div className="space-y-2">
                          {subject.teacherCount !== undefined && (
                            <p className="text-muted-foreground text-sm">
                              <span className="font-medium">Teachers:</span>{" "}
                              {subject.teacherCount}
                            </p>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Link
                          href={`/teachers?subject=${subject.id}`}
                          className="w-full"
                        >
                          <Button variant="outline" className="w-full">
                            Find Teachers
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {totalItems === 0 ? (
                  <div className="py-12 text-center">
                    <h3 className="mb-2 text-lg font-medium">
                      No subjects found
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters
                    </p>
                  </div>
                ) : (
                  totalPages > 1 && (
                    <div className="mt-8">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (hasPrevPage) setPage(page - 1);
                              }}
                              className={
                                !hasPrevPage
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>

                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              // Logic to show pages around current page
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (page <= 3) {
                                pageNum = i + 1;
                              } else if (page >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = page - 2 + i;
                              }

                              // Show ellipsis for large page ranges
                              if (totalPages > 5) {
                                if (i === 0 && pageNum > 1) {
                                  return (
                                    <PaginationItem key="start-ellipsis">
                                      <PaginationEllipsis />
                                    </PaginationItem>
                                  );
                                }
                                if (i === 4 && pageNum < totalPages) {
                                  return (
                                    <PaginationItem key="end-ellipsis">
                                      <PaginationEllipsis />
                                    </PaginationItem>
                                  );
                                }
                              }

                              return (
                                <PaginationItem key={pageNum}>
                                  <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setPage(pageNum);
                                    }}
                                    isActive={pageNum === page}
                                  >
                                    {pageNum}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            },
                          )}

                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (hasNextPage) setPage(page + 1);
                              }}
                              className={
                                !hasNextPage
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
