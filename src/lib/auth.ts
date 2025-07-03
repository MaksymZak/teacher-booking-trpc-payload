import { headers } from "next/headers";
import { getPayloadClient } from "@/db/client";
import { redirect } from "next/navigation";
import { TypedUser } from "payload";
import { User } from "@/payload-types";

export async function getCurrentUser(): Promise<TypedUser | null> {
  try {
    const payload = await getPayloadClient();
    const headersList = await headers();

    const result = await payload.auth({
      headers: headersList,
    });

    return result.user;
  } catch (error: unknown) {
    console.error(error);
    return null;
  }
}

export const requireAuth = async (): Promise<TypedUser> => {
  const user = await getCurrentUser();
  if (user === null) {
    redirect("/auth");
  }
  return user;
};
