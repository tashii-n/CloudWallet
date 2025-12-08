import { getSession } from "@/app/lib/session";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) return NextResponse.json({ authenticated: false });

    const session = await getSession(sessionId);
    if (!session || !session.cloudAuth) {
      return NextResponse.json({ authenticated: false });
    }

    const { cloudAccessTokenExpirationTime } = session.cloudAuth;
    if (Date.now() >= cloudAccessTokenExpirationTime) {
      // Token expired → try refresh

      return NextResponse.json({ authenticated: false });
    }
    // Valid session
    return NextResponse.json({ authenticated: true });
  } catch (e) {
    return NextResponse.json({ authenticated: false });
  }
}
