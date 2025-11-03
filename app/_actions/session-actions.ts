"use server";

import { redirect } from "next/navigation";
import { deleteSession as clearSessionCookies, verifySessions } from "@/lib/session";
import { AUTH_SESSION, USER_SESSION, PERMISSIONS_SESSION } from "@/lib/constants";

/**
 * Retrieves and consolidates session data from cookies.
 * This is the server-side function our client cache will call.
 */
export async function getSystemSetup() {
  try {
    const { isAuthenticated, session } = await verifySessions([
      AUTH_SESSION,
      USER_SESSION,
      PERMISSIONS_SESSION
    ]);

    if (!isAuthenticated) {
      return { success: false, message: "User not authenticated." };
    }

    return { success: true, data: session };
  } catch (error) {
    console.error("Failed to get system setup:", error);
    return { success: false, message: "An error occurred." };
  }
}

/**
 * Server action to handle user logout.
 * It clears server-side cookies and then redirects.
 */
export async function logout() {
  await clearSessionCookies();
  redirect("/login");
}
