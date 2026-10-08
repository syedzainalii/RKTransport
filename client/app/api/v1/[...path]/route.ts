import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const backendBase = (process.env.API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

async function proxy(request: NextRequest) {
  const upstreamUrl = `${backendBase}${request.nextUrl.pathname}${request.nextUrl.search}`;
  const headers = new Headers();
  for (const name of ["accept", "content-type", "cookie", "authorization"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const response = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  for (const name of ["content-type", "cache-control"]) {
    const value = response.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  const cookie = response.headers.get("set-cookie");
  if (cookie) responseHeaders.append("set-cookie", cookie.replace(/;\s*Domain=[^;]*/i, ""));
  return new NextResponse(response.body, { status: response.status, headers: responseHeaders });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;

export async function OPTIONS() {
  return NextResponse.json({ detail: "Method not allowed" }, { status: 405, headers: { Allow: allowedMethods.join(", ") } });
}
