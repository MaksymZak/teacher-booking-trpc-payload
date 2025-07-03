import React from "react";
import "./styles.css";
import { TRPCReactProvider } from "@/trpc/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { headers as getHeaders } from "next/headers.js";
import { getPayload } from "payload";
import config from "@/payload.config";

export const metadata = {
  description: "Teacher Booking Platform",
  title: "Teacher Booking",
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  // Get user for navigation
  const headers = await getHeaders();
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });
  const { user } = await payload.auth({ headers });

  return (
    <html lang="en">
      <body>
        <NuqsAdapter>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
