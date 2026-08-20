import { NextResponse } from "next/server";
import { withSecurityHeaders } from '@/lib/with-security-headers';

export async function GET() {
  return withSecurityHeaders(NextResponse.json({ message: "ASAS Immobilier API", version: "1.0.0" }));
}
