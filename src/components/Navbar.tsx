"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useAuth } from "@payloadcms/ui";

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {}, [user]);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="mb-6 border-b py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold text-purple-700 xl:text-3xl"
        >
          Teacher Booking
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className={`px-4 py-2 font-medium ${
              isActive("/")
                ? "font-semibold text-purple-900"
                : "text-purple-700 hover:text-purple-900"
            }`}
          >
            Home
          </Link>
          <Link
            href="/subjects"
            className={`px-4 py-2 font-medium ${
              isActive("/subjects")
                ? "font-semibold text-purple-900"
                : "text-purple-700 hover:text-purple-900"
            }`}
          >
            Subjects
          </Link>
          <Link
            href="/teachers"
            className={`px-4 py-2 font-medium ${
              isActive("/teachers")
                ? "font-semibold text-purple-900"
                : "text-purple-700 hover:text-purple-900"
            }`}
          >
            Teachers
          </Link>
          {user ? (
            <Button asChild variant="outline">
              <Link href="/profile">My Profile</Link>
            </Button>
          ) : (
            <Button asChild variant="default">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
