# API & Data Communication

The application primarily uses **Next.js Server Actions** for client-server communication, rather than traditional REST or GraphQL API endpoints. This allows client components to securely call server-side functions directly.

## Core Server Actions

These actions are defined in `app/_actions/session-actions.ts`.

### `getSystemSetup()`

- **Purpose**: Retrieves and consolidates all session data for the currently logged-in user.
- **Process**: It calls `verifySessions()` from `lib/session.ts` to decrypt and validate the `AUTH_SESSION`, `USER_SESSION`, and `PERMISSIONS_SESSION` cookies.
- **Usage**: This is the main entry point for the client-side session cache (`useSessionStore`) to fetch and revalidate user data.
- **Returns**: A success flag and a `data` object containing the combined session information.

### `logout()`

- **Purpose**: Logs the user out of the system.
- **Process**: It calls the `clearSessionCookies()` helper (which is an alias for `deleteSession`) to remove all session-related cookies from the browser and then performs a server-side redirect to the `/login` page.
