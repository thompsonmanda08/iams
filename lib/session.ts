import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { AuthSession, Permission, UserSession } from "@/lib/types";

import { AUTH_SESSION, USER_SESSION } from "./constants";
import { User, UserType } from "./types/account";

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

export async function decrypt(session: any) {
  if (!session || typeof session !== "string") {
    return {
      success: false,
      message: "No session token provided",
      data: null,
      status: 500,
      statusText: "UNAUTHENTICATED"
    };
  }

  const parts = session.split(".");

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
    const { payload } = await jwtVerify(session, key, {
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
  const session = await encrypt(newSession);

  // Ensure `session` is successfully created before setting the cookie
  if (session) {
    (await cookies()).set(AUTH_SESSION, session, {
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

export async function updateAuthSession(fields: any): Promise<AuthSession> {
  const [{ isAuthenticated: isLoggedIn, session: oldSession }, backupUserSession] =
    await Promise.all([verifySession(), getUserSession()]);

  const backupUser = (backupUserSession?.user || {}) as User;
  const backupPermissions = (backupUserSession?.permissions || []) as Permission[];

  console.log("🔄 [updateAuthSession] Current state:", {
    hasOldSession: !!oldSession,
    hasBackupUser: backupUser && Object.keys(backupUser).length > 0,
    fieldsToUpdate: Object.keys(fields),
    hasOldUser: !!(oldSession?.user && Object.keys(oldSession.user).length > 0)
  });

  if (isLoggedIn && oldSession) {
    // Remove any null values from the old session (cleanup from previous bugs)
    const cleanedOldSession = Object.fromEntries(
      Object.entries(oldSession).filter(([_, value]) => value !== null)
    ) as AuthSession;

    // Merge old session with new fields, preserving all existing data
    // Filter out undefined and null values from fields to prevent overwriting existing data
    const filteredFields = Object.fromEntries(
      Object.entries(fields).filter(([_, value]) => value !== undefined && value !== null)
    );

    // Determine user: prefer new user data, then existing session user, then backup
    let finalUser: User | undefined;
    if (filteredFields.user && Object.keys(filteredFields.user).length > 0) {
      finalUser = filteredFields.user as User;
      console.log("✅ [updateAuthSession] Using new user data from fields");
    } else if (cleanedOldSession.user && Object.keys(cleanedOldSession.user).length > 0) {
      finalUser = cleanedOldSession.user as User;
      console.log("♻️ [updateAuthSession] Keeping existing session user");
    } else if (backupUser && Object.keys(backupUser).length > 0) {
      finalUser = backupUser;
      console.log("🔄 [updateAuthSession] Restoring user from backup");
    } else {
      console.warn("⚠️ [updateAuthSession] No user data available!");
    }

    const newSession: AuthSession = {
      ...cleanedOldSession,
      ...filteredFields,
      user: finalUser,
      permissions: (filteredFields.permissions ||
        cleanedOldSession.permissions ||
        backupPermissions) as Permission[]
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
  return oldSession as AuthSession;
}

export async function verifySession(): Promise<{
  isAuthenticated: boolean;
  session: AuthSession | null;
  user?: Partial<User> | null;
  permissions?: any[];
  [key: string]: any;
}> {
  const cookie = (await cookies()).get(AUTH_SESSION)?.value;
  const session = await decrypt(cookie);

  if (session?.accessToken) {
    return {
      isAuthenticated: true,
      session: session as AuthSession
    };
  }

  return { isAuthenticated: false, session: null };
}

// SAVE USER AND PERMISSIONS BACKUP
export async function createUserSession(user: any, permissions?: any[]) {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const backup = { user, permissions, savedAt: new Date().toISOString() };
    const encryptedBackup = await encrypt(backup);

    (await cookies()).set(USER_SESSION, encryptedBackup, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "strict",
      path: "/"
    });

    // console.log("💾 [createUserSession] User backup saved successfully");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save user backup:", error);
    return { success: false, error: error?.message };
  }
}

// RETRIEVE USER AND PERMISSIONS BACKUP
export async function getUserSession(): Promise<{
  user: User;
  permissions: Permission[];
  savedAt?: string;
} | null> {
  try {
    const cookie = (await cookies()).get(USER_SESSION)?.value;
    if (!cookie) return null;

    const backup = await decrypt(cookie);

    if (backup?.user) {
      console.log("📦 [getUserSession] User backup retrieved successfully");
      return backup as { user: User; permissions: Permission[]; savedAt?: string };
    }

    return null;
  } catch (error: any) {
    console.error("Failed to retrieve user backup:", error);
    return null;
  }
}

// DELETE THE SESSION
export async function deleteSession() {
  try {
    const cookieStore = await cookies();

    // Delete all session cookies
    cookieStore.delete(AUTH_SESSION);
    cookieStore.delete(USER_SESSION); // Also delete user backup

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
