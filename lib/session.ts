import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { AuthSession, Permission } from "@/lib/types";

import { AUTH_SESSION, USER_SESSION, PERMISSIONS_SESSION } from "./constants";
import { User, UserType } from "./types/account";
import { cache } from "react";

// 1. Get secret from environment variables (MUST be set) - SERVER SIDE ONLY
// Note: Validation is deferred to runtime to avoid build-time issues
const getSecretKey = () => {
  const secretKey = process.env.AUTH_SECRET;

  if (!secretKey || secretKey.length < 32) {
    throw new Error(
      "JWT_SECRET or AUTH_SECRET environment variable must be at least 32 characters"
    );
  }

  return secretKey;
};

// 3. Create the key properly - defer until runtime
const getKey = () => new TextEncoder().encode(getSecretKey());

export async function encrypt(payload: any) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload must be a non-empty object");
  }

  const key = getKey();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}

export async function decrypt(token: any) {
  if (!token || typeof token !== "string") {
    return {
      success: false,
      message: "No session token provided",
      data: null,
      status: 500,
      statusText: "UNAUTHENTICATED"
    };
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return {
      success: false,
      message: "Invalid token format",
      data: null,
      status: 500,
      statusText: "INVALID_TOKEN_FORMAT"
    };
  }

  try {
    const key = getKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      clockTolerance: 15
    });

    return payload;
  } catch (error: Error | any) {
    console.error(error);

    // Specific error handling
    if (error.code === "ERR_JWS_INVALID") {
      return {
        success: false,
        message: "Invalid token signature",
        data: null,
        status: 500,
        statusText: "INVALID_TOKEN_SIGNATURE"
      };
    }

    if (error.code === "ERR_JWT_EXPIRED") {
      return {
        success: false,
        message: "Token expired",
        data: null,
        status: 500,
        statusText: "TOKEN_EXPIRED"
      };
    }

    // return null;
    return {
      success: false,
      message: "Failed to verify session",
      data: null,
      status: 500,
      statusText: "TOKEN_VERIFICATION_FAILED"
    };
  }
}

export async function createAuthSession({
  accessToken,
  user_type,
  change_password,
  mfa_required,
  organization_id
}: {
  accessToken: string;
  user_type: UserType;
  change_password?: boolean;
  mfa_required?: boolean;
  organization_id?: string;
}): Promise<void> {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // AFTER 1 HOUR

  const newSession: AuthSession = {
    accessToken: accessToken || "",
    change_password,
    mfa_required,
    organization_id,
    expiresAt
  };

  // Call `encrypt` to generate the session token
  const token = await encrypt(newSession);

  // Ensure `session` is successfully created before setting the cookie
  if (token) {
    (await cookies()).set(AUTH_SESSION, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "strict",
      path: "/"
    });
  } else {
    throw new Error("Failed to create session token.");
  }
}

export async function createUserSession(user: User): Promise<void> {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // AFTER 1 HOUR

  const newSession = { ...user, expiresAt };

  // Call `encrypt` to generate the session token
  const token = await encrypt(newSession);

  // Ensure `session` is successfully created before setting the cookie
  if (token) {
    (await cookies()).set(USER_SESSION, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "strict",
      path: "/"
    });
  } else {
    throw new Error("Failed to create session token.");
  }
}

export async function createPermissionsSession(pem: Permission[]): Promise<void> {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // AFTER 1 HOUR

  const newSession = { ...pem, expiresAt };

  // Call `encrypt` to generate the session token
  const token = await encrypt(newSession);

  // Ensure `session` is successfully created before setting the cookie
  if (token) {
    (await cookies()).set(PERMISSIONS_SESSION, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "strict",
      path: "/"
    });
  } else {
    throw new Error("Failed to create session token.");
  }
}

export async function updateAuthSession(fields: any): Promise<AuthSession | undefined> {
  const { isAuthenticated: isLoggedIn, session: oldSession } = await verifySession();

  if (isLoggedIn && oldSession) {
    // Remove any null values from the old session (cleanup from previous bugs)
    const cleanedOldSession = Object.fromEntries(
      Object.entries(oldSession).filter(([_, value]) => value !== null)
    ) as AuthSession;

    const newSession: AuthSession = {
      ...cleanedOldSession,
      ...fields
    };

    // Determine expiration: use provided expiresAt from fields, keep existing, or create new
    const expiresAt = fields?.expiresAt
      ? new Date(fields.expiresAt)
      : oldSession?.expiresAt
        ? new Date(oldSession.expiresAt)
        : new Date(Date.now() + 60 * 60 * 1000);

    // Ensure expiresAt is included in the session payload
    newSession.expiresAt = expiresAt;

    // Call `encrypt` to generate the session token
    const session = await encrypt(newSession);

    if (session) {
      (await cookies()).set(AUTH_SESSION, session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
        sameSite: "strict",
        path: "/"
      });
      return newSession;
    } else {
      throw new Error("Failed to update session token.");
    }
  }
  return;
}

export async function verifySession(): Promise<{
  isAuthenticated: boolean;
  session: AuthSession | null;
  user?: Partial<User> | null;
  permissions?: any[];
  [key: string]: any;
}> {
  try {
    const cookie = (await cookies()).get(AUTH_SESSION)?.value;

    // No cookie present
    if (!cookie) {
      return { isAuthenticated: false, session: null };
    }

    const decrypted = await decrypt(cookie);

    // Check if decryption returned an error object
    if (!decrypted || decrypted.success === false) {
      // Invalid token - clean up
      await deleteSession();
      return { isAuthenticated: false, session: null };
    }

    const session = decrypted as AuthSession;

    // Check if session has required accessToken
    if (!session?.accessToken) {
      return { isAuthenticated: false, session: null };
    }

    // Check token expiration
    if (session?.expiresAt) {
      const expiresAt = new Date(session.expiresAt);
      const now = new Date();

      if (expiresAt < now) {
        // Token is expired, delete it
        await deleteSession();
        return { isAuthenticated: false, session: null };
      }
    }

    // Session is valid
    return {
      isAuthenticated: true,
      session: session
    };
  } catch (error) {
    console.error("[verifySession] Error:", error);
    // On any error, return unauthenticated
    return { isAuthenticated: false, session: null };
  }
}

// DELETE THE SESSION
export async function deleteSession() {
  try {
    const cookieStore = await cookies();

    // Delete all session cookies
    cookieStore.delete(AUTH_SESSION);
    cookieStore.delete(USER_SESSION); // Also delete user backup
    cookieStore.delete(PERMISSIONS_SESSION);

    return { success: true, message: "Logout Success" };
  } catch (error: any) {
    console.error("Failed to delete session cookies:", error);

    return {
      success: false,
      message: "Failed to clear session cookies",
      error: error?.message || "Unknown error"
    };
  }
}

// --- NEW SESSION GETTER FUNCTIONS ---

/**
 * Retrieves and decrypts the AUTH_SESSION cookie.
 * Contains access token and other auth-related flags.
 */
export async function getAuthSession(): Promise<Omit<AuthSession, "user" | "permissions"> | null> {
  const cookie = (await cookies()).get(AUTH_SESSION)?.value;
  if (!cookie) return null;
  return decrypt(cookie);
}

/**
 * Retrieves and decrypts the USER_SESSION cookie.
 * Contains public user profile information.
 */
export async function _getUserSession(): Promise<AuthSession["user"] | null> {
  const cookie = (await cookies()).get(USER_SESSION)?.value;
  if (!cookie) return null;
  return decrypt(cookie) as AuthSession["user"];
}

export const getUserSession = cache(_getUserSession);

/**
 * Retrieves and decrypts the PERMISSIONS_SESSION cookie.
 * Contains user permissions.
 */
export async function getPermissionsSession(): Promise<AuthSession["permissions"] | null> {
  const cookie = (await cookies()).get(PERMISSIONS_SESSION)?.value;
  if (!cookie) return null;
  return decrypt(cookie) as unknown as AuthSession["permissions"];
}

/**
 * Verifies one or more session cookies and returns a consolidated session object.
 * @param sessionNames Array of cookie names to verify (e.g., [AUTH_SESSION, USER_SESSION])
 * @returns An object with isAuthenticated flag and a session object with combined data.
 */
export async function verifySessions(
  sessionNames: string[] = [AUTH_SESSION]
): Promise<{ isAuthenticated: boolean; session: any }> {
  const cookieStore = await cookies();
  const sessionPromises = sessionNames.map(async (name) => {
    const cookie = cookieStore.get(name)?.value;
    if (!cookie) return null;
    const data = await decrypt(cookie);
    // Ensure we don't return decryption error objects
    return data && !data.success === false ? data : null;
  });

  const decryptedSessions = await Promise.all(sessionPromises);

  const consolidatedSession = decryptedSessions.reduce((acc, curr) => {
    if (curr) return { ...acc, ...curr };
    return acc;
  }, {});

  const isAuthenticated = !!consolidatedSession?.accessToken;

  return { isAuthenticated, session: consolidatedSession };
}
