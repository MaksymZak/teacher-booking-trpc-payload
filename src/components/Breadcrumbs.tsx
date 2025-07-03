"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HomeIcon } from "lucide-react";

interface BreadcrumbsProps {
  items?: {
    label: string;
    href: string;
    isCurrent?: boolean;
  }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Generate breadcrumbs based on the current path if no items provided
  const generatedItems = items || generateBreadcrumbs(pathname);

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">
              <HomeIcon className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {generatedItems.map((item, index) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem>
              {item.isCurrent ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < generatedItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Helper function to generate breadcrumbs based on the URL path
function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  // If we're in debug route, handle special case
  if (segments.includes("debug")) {
    const isTeacherDebug =
      segments[0] === "teachers" && segments[1] === "debug";

    if (isTeacherDebug) {
      return [
        { label: "Teachers", href: "/teachers", isCurrent: false },
        {
          label: "Debug",
          href: `/teachers/debug/${segments[2]}`,
          isCurrent: true,
        },
      ];
    }
  }

  const breadcrumbs = [];
  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Skip dynamic route segments like [id] for label generation
    // But keep their actual values in the path
    if (segment === "[id]") continue;

    // Handle teacher ID segment specially
    if (i > 0 && segments[i - 1] === "teachers" && segment !== "debug") {
      breadcrumbs.push({
        label: "Teacher Details",
        href: currentPath,
        isCurrent: i === segments.length - 1,
      });
      continue;
    }

    // Handle subject ID segment specially
    if (i > 0 && segments[i - 1] === "subjects") {
      breadcrumbs.push({
        label: "Subject Details",
        href: currentPath,
        isCurrent: i === segments.length - 1,
      });
      continue;
    }

    // Capitalize the first letter of each word for the label
    const label = segment
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    breadcrumbs.push({
      label,
      href: currentPath,
      isCurrent: i === segments.length - 1,
    });
  }

  return breadcrumbs;
}
