import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Fisierul CV este obligatoriu." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: "Format CV invalid. Acceptam PDF/DOC/DOCX." },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "CV-ul depaseste limita de 5MB." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = path.extname(file.name) || ".pdf";
    const fileName = `${Date.now()}-${randomUUID()}${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "cv");
    await mkdir(uploadDir, { recursive: true });
    const fullPath = path.join(uploadDir, fileName);
    await writeFile(fullPath, buffer);

    return NextResponse.json({
      message: "CV incarcat cu succes.",
      url: `/uploads/cv/${fileName}`,
    });
  } catch {
    return NextResponse.json(
      { message: "A aparut o eroare la upload CV." },
      { status: 500 },
    );
  }
}
