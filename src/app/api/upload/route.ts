import { NextRequest, NextResponse } from "next/server";
import { writeFile, access } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { constants } from "fs";

import { checkJobStatePeriodically, fileQueue } from "../../../lib/queue";

const uploadsFolder = path.join(process.cwd(), "uploads");

function hashFileName(fileName: string, fileBuffer: Buffer) {
  const hash = crypto.createHash("sha256");
  hash.update(fileName);
  hash.update(fileBuffer);
  return hash.digest("hex");
}

async function fileExists(filePath: string) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const jobs = [];

    for (const file of files) {
      // Convert file content to a buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Hash the file name and content to generate a unique ID
      const fileId = hashFileName(file.name, buffer);

      // Construct the file path using the hash
      const filePath = path.join(uploadsFolder, fileId);

      // Check if the file already exists
      if (await fileExists(filePath)) {
        console.log(`File ${fileId} already exists.`);
        jobs.push({
          name: file.name,
          fileId,
          jobId: null,
          message: "File already exists",
        });
        continue;
      }

      // Store the file using the hash as the filename
      await writeFile(filePath, buffer);

      // Add a new job to Bull for background processing
      const job = await fileQueue.add({ fileId, name: file.name });
      checkJobStatePeriodically(job.id + "");
      jobs.push({ name: file.name, fileId, jobId: job.id });
    }

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (err) {
    console.error(err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
