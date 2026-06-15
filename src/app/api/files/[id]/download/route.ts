import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { storageProvider } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  const { id } = await params;
  const file = await prisma.fileAsset.findFirst({
    where: {
      id,
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
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.filename)}"`,
      "Content-Length": String(object.data.byteLength),
      "Content-Type": file.mimeType,
    },
  });
}
