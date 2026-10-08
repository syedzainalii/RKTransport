import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET || "";
  let payload: { secret?: string; paths?: string[] };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
  }

  const supplied = payload.secret || "";
  const expectedBytes = Buffer.from(expected);
  const suppliedBytes = Buffer.from(supplied);
  if (!expected || expectedBytes.length !== suppliedBytes.length || !timingSafeEqual(expectedBytes, suppliedBytes)) {
    return NextResponse.json({ detail: "Invalid revalidation secret" }, { status: 401 });
  }
  if (payload.paths && (!Array.isArray(payload.paths) || payload.paths.some((path) => typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")))) {
    return NextResponse.json({ detail: "Paths must be site-relative paths" }, { status: 400 });
  }

  for (const path of payload.paths?.length ? payload.paths : ["/"]) {
    revalidatePath(path, path === "/" ? "layout" : undefined);
  }
  return NextResponse.json({ revalidated: true, paths: payload.paths?.length ? payload.paths : ["/"] });
}
