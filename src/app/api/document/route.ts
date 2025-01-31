import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return NextResponse.json({ error: "File ID is required" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "documents", `${fileId}.json`);

  try {
    const data = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(data);
    return NextResponse.json({ content: jsonData });
  } catch (error) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
}
