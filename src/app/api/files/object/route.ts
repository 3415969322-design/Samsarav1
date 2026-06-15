import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { storageProvider } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const session = await requireSession();
  const key = request.nextUrl.searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing storage key." }, { status: 400 });
  }

  const file = await prisma.fileAsset.findFirst({
    where: {
      storageKey: key,
      userId: session.userId,
    },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const object = await storageProvider.getObject(file.storageKey);

  if (!object) {
    return NextResponse.json({ error: "Stored object not found." }, { status: 404 });
  }

  return new Response(new Uint8Array(object.data), {
    headers: {
      "Cache-Control": "private, max-age=60",
      "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
      "Content-Length": String(object.data.byteLength),
      "Content-Type": file.mimeType,
    },
  });
}
