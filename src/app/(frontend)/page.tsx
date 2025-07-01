import { headers as getHeaders } from "next/headers.js";
import Image from "next/image";
import { getPayload } from "payload";
import React from "react";
import { fileURLToPath } from "url";

import config from "@/payload.config";
import "./styles.css";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const headers = await getHeaders();
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });
  const { user } = await payload.auth({ headers });

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold text-purple-700 xl:text-4xl">
        Welcome to Teacher Booking
      </h1>

      <Button type="button">Shadcn/ui</Button>
    </div>
  );
}
