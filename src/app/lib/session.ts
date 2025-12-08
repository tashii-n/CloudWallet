// lib/session.ts
interface CloudAuth {
  cloudAccessToken: string;
  cloudAccessTokenExpirationTime: number;
  refreshToken?: string;
  refreshTokenExpirationTime?: number;
}

interface SessionData {
  auth?: {
    accessToken: string;
    secretKey: string;
    expiresAt: number;
  };
  cloudAuth?: CloudAuth;
}

// 🟢 In dev: pin sessions to globalThis so they survive hot reloads
// 🚀 In prod: use normal in-memory Maps (cleared on server restart)
const isDev = process.env.NODE_ENV !== "production";

const globalForSessions = globalThis as unknown as {
  sessions?: Map<string, SessionData>;
  sessionLastAccess?: Map<string, number>;
};

const sessions: Map<string, SessionData> =
  (isDev && globalForSessions.sessions) || new Map<string, SessionData>();

const sessionLastAccess: Map<string, number> =
  (isDev && globalForSessions.sessionLastAccess) || new Map<string, number>();

if (isDev) {
  globalForSessions.sessions = sessions;
  globalForSessions.sessionLastAccess = sessionLastAccess;
}

// Configuration
const CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes
const CLEANUP_RUN_INTERVAL = 10 * 60 * 1000; // 10 minutes

export const getSession = (sessionId: string): SessionData => {
  sessionLastAccess.set(sessionId, Date.now());

  if (!sessions.has(sessionId)) {
    console.log(`❌ Creating NEW session for ID: ${sessionId}`);
    sessions.set(sessionId, {});
  } else {
    console.log(
      `✅ Retrieved EXISTING session for ID: ${sessionId}`
      //   ,
      //   JSON.stringify(sessions.get(sessionId), null, 2)
    );
  }

  return sessions.get(sessionId)!;
};

export const setSession = (sessionId: string, data: Partial<SessionData>) => {
  const existing = getSession(sessionId);
  const newData = { ...existing, ...data };
  sessions.set(sessionId, newData);
  console.log(
    `✅ SET session data for ID: ${sessionId}`
    // ,
    // JSON.stringify(newData, null, 2)
  );
};

export const clearSession = (sessionId: string) => {
  sessions.delete(sessionId);
  sessionLastAccess.delete(sessionId);
};

const cleanupExpiredSessions = () => {
  const cutoff = Date.now() - CLEANUP_INTERVAL;
  let cleanedCount = 0;

  for (const [sessionId, lastAccess] of sessionLastAccess.entries()) {
    if (lastAccess < cutoff) {
      sessions.delete(sessionId);
      sessionLastAccess.delete(sessionId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} expired sessions`);
  }
};

export const getSessionStats = () => ({
  totalSessions: sessions.size,
  activeSessions: Array.from(sessions.keys()),
  oldestSession:
    sessionLastAccess.size > 0 ? Math.min(...sessionLastAccess.values()) : null,
  newestSession:
    sessionLastAccess.size > 0 ? Math.max(...sessionLastAccess.values()) : null,
});

export const forceCleanup = () => {
  cleanupExpiredSessions();
};

// Only run cleanup on server-side
if (typeof window === "undefined") {
  const CLEANUP_SYMBOL = Symbol.for("session-cleanup-timer");

  if ((global as any)[CLEANUP_SYMBOL]) {
    clearInterval((global as any)[CLEANUP_SYMBOL]);
  }

  const cleanupTimer = setInterval(
    cleanupExpiredSessions,
    CLEANUP_RUN_INTERVAL
  );
  (global as any)[CLEANUP_SYMBOL] = cleanupTimer;

  console.log(
    "Session cleanup initialized - running every",
    CLEANUP_RUN_INTERVAL / 1000 / 60,
    "minutes"
  );
}
