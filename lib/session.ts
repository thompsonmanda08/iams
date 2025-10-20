import 'server-only';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

import { AuthSession, UserSession, WorkspaceSession } from '@/types';

import { AUTH_SESSION, USER_SESSION, WORKSPACE_SESSION } from './constants';

// 1. Get secret from environment variables (MUST be set) - SERVER SIDE ONLY
// Note: Validation is deferred to runtime to avoid build-time issues
const getSecretKey = () => {
  const secretKey = process.env.AUTH_SECRET;

  if (!secretKey || secretKey.length < 32) {
    throw new Error(
      'JWT_SECRET or AUTH_SECRET environment variable must be at least 32 characters',
    );
  }

  return secretKey;
};

// 3. Create the key properly - defer until runtime
const getKey = () => new TextEncoder().encode(getSecretKey());

export async function encrypt(payload: any) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be a non-empty object');
  }

  const key = getKey();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key);
}

export async function decrypt(session: any) {
  if (!session || typeof session !== 'string') {
    return {
      success: false,
      message: 'No session token provided',
      data: null,
      status: 500,
      statusText: 'UNAUTHENTICATED',
    };
  }

  const parts = session.split('.');

  if (parts.length !== 3) {
    return {
      success: false,
      message: 'Invalid token format',
      data: null,
      status: 500,
      statusText: 'INVALID_TOKEN_FORMAT',
    };
  }

  try {
    const key = getKey();
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
      clockTolerance: 15,
    });

    return payload;
  } catch (error: Error | any) {
    console.error(error);

    // Specific error handling
    if (error.code === 'ERR_JWS_INVALID') {
      return {
        success: false,
        message: 'Invalid token signature',
        data: null,
        status: 500,
        statusText: 'INVALID_TOKEN_SIGNATURE',
      };
    }

    if (error.code === 'ERR_JWT_EXPIRED') {
      return {
        success: false,
        message: 'Token expired',
        data: null,
        status: 500,
        statusText: 'TOKEN_EXPIRED',
      };
    }

    // return null;
    return {
      success: false,
      message: 'Failed to verify session',
      data: null,
      status: 500,
      statusText: 'TOKEN_VERIFICATION_FAILED',
    };
  }
}

export async function createAuthSession(accessToken: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // AFTER 1 HOUR

  // Call `encrypt` to generate the session token
  const session = await encrypt({
    accessToken: accessToken || '',
    expiresAt,
  });

  // Ensure `session` is successfully created before setting the cookie
  if (session) {
    (await cookies()).set(AUTH_SESSION, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'strict',
      path: '/',
    });
  } else {
    throw new Error('Failed to create session token.');
  }
}

export async function updateAuthSession(fields: any): Promise<void> {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const isLoggedIn = await verifySession();
  const cookie = (await cookies()).get(AUTH_SESSION)?.value;
  const oldSession = await decrypt(cookie);

  if (isLoggedIn && oldSession) {
    const session = await encrypt({
      ...oldSession,
      ...fields,
    });

    if (session) {
      (await cookies()).set(AUTH_SESSION, session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        sameSite: 'strict',
        path: '/',
      });
    } else {
      throw new Error('Failed to update session token.');
    }
  }
}

export async function createUserSession({
  user,
  merchantID,
  userPermissions,
  kyc,
}: UserSession): Promise<void> {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const session = await encrypt({
    user,
    merchantID,
    userPermissions,
    kyc,
  });

  if (session) {
    (await cookies()).set(USER_SESSION, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'strict',
      path: '/',
    });
  } else {
    throw new Error('Failed to create user session token.');
  }
}

export async function createWorkspaceSession({
  workspaceIDs,
  workspacePermissions,
}: WorkspaceSession): Promise<void> {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const session = await encrypt({
    workspaceIDs,
    workspacePermissions,
  });

  if (session) {
    (await cookies()).set(WORKSPACE_SESSION, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'strict',
      path: '/',
    });
  } else {
    throw new Error('Failed to create workspace session token.');
  }
}

// UPDATE THE WORKSPACE SESSION
export async function updateWorkspaceSession(
  fields: any,
): Promise<WorkspaceSession | void> {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const isLoggedIn = await verifySession();
  const cookie = (await cookies()).get(WORKSPACE_SESSION)?.value;
  const oldSession = await decrypt(cookie);

  const updatedSession = {
    ...oldSession,
    ...fields,
    workspacePermissions: (fields?.workspacePermissions ??
      oldSession?.workspacePermissions) as WorkspaceSession['workspacePermissions'],
  };

  if (isLoggedIn && oldSession) {
    const session = await encrypt(updatedSession);

    if (session) {
      (await cookies()).set(WORKSPACE_SESSION, session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        sameSite: 'strict',
        path: '/',
      });

      return updatedSession as WorkspaceSession;
    } else {
      throw new Error('Failed to update workspace session token.');
    }
  }
}

export async function verifySession(): Promise<boolean> {
  const cookie = (await cookies()).get(AUTH_SESSION)?.value;
  const session = await decrypt(cookie);

  if (session?.accessToken) return true;

  return false;
}

export async function getServerSession(): Promise<AuthSession | null> {
  const isLoggedIn = await verifySession();
  const cookie = (await cookies()).get(AUTH_SESSION)?.value;
  const session = await decrypt(cookie);

  if (isLoggedIn) {
    return session as unknown as AuthSession;
  } else {
    return null;
  }
}

export async function getUserSession(): Promise<UserSession | null> {
  const isLoggedIn = await verifySession();

  const cookie = (await cookies()).get(USER_SESSION)?.value;
  const session = await decrypt(cookie);

  if (isLoggedIn) {
    return session as unknown as UserSession;
  } else {
    return null;
  }
}

export async function getWorkspaceSessionData(): Promise<WorkspaceSession | null> {
  const isLoggedIn = await verifySession();

  const cookie = (await cookies()).get(WORKSPACE_SESSION)?.value;
  const session = await decrypt(cookie);

  if (isLoggedIn) {
    return session as unknown as WorkspaceSession;
  } else {
    return null;
  }
}

// DELETE THE SESSION
export async function deleteSession() {
  try {
    const cookieStore = await cookies();

    // Delete all session cookies
    cookieStore.delete(AUTH_SESSION);
    cookieStore.delete(USER_SESSION);
    cookieStore.delete(WORKSPACE_SESSION);

    return { success: true, message: 'Logout Success' };
  } catch (error: any) {
    console.error('Failed to delete session cookies:', error);

    return {
      success: false,
      message: 'Failed to clear session cookies',
      error: error?.message || 'Unknown error'
    };
  }
}
