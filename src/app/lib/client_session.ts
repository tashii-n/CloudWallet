import { v4 as uuidv4 } from "uuid";

/**
 * Get or generate a tab-specific session ID.
 * Stored in sessionStorage so it's unique per tab.
 */
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("sessionId");

  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem("sessionId", sessionId);
  }

  return sessionId;
};
