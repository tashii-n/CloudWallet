import { clearSession } from "@/app/lib/session";

export async function POST(req: Request) {
  const sessionId = req.headers.get("x-session-id");
  if (!sessionId)
    return new Response("No sessionId", { status: 400 });

  // Clear the entire session
  clearSession(sessionId);

  return new Response(JSON.stringify({ success: true }));
}
