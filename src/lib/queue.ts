import fs from "fs/promises";
import Queue from "bull";
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { addDocumentsToVectorStore } from "../lib/vectorStore";

const uploadsFolder = path.join(process.cwd(), "uploads");
const documentsFolder = path.join(process.cwd(), "documents");

// Create a new Bull queue
export const fileQueue = new Queue("file-processing", {
  redis: {
    host: "localhost",
    port: 6379,
  },
});

// Define how jobs will be processed
fileQueue.process(async (job) => {
  const { fileId } = job.data;
  const filePath = path.join(uploadsFolder, fileId);
  console.log("file queue > ", filePath);

  // Process the PDF and split into documents
  const docs = await processPDF(filePath);

  // Save the extracted documents as JSON
  const jsonFilePath = path.join(documentsFolder, `${fileId}.json`);
  await fs.writeFile(jsonFilePath, JSON.stringify(docs, null, 2), "utf8");
  console.log(`Extracted documents saved to ${jsonFilePath}`);

  // Add documents to the vector store
  await addDocumentsToVectorStore(docs, fileId);

  return { success: true, jsonFilePath };
});

const processPDF = async (filePath) => {
  const loader = new PDFLoader(filePath);
  const documents = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  return await textSplitter.splitDocuments(documents);
};

export async function checkJobStatePeriodically(jobId: string) {
  try {
    const interval = setInterval(async () => {
      const job = await fileQueue.getJob(jobId);

      if (!job) {
        console.log("Job not found. Exiting...");
        clearInterval(interval);
        return;
      }

      // Get the job's state
      const state = await job.getState();
      console.log(`Job state: ${state}`);

      // Additional details (optional)
      console.log("Job progress:", job.progress());
      console.log("Job data:", job.data);

      // If the job is completed or failed, stop the interval
      if (state === "completed") {
        console.log("Job completed. Result:", await job.returnvalue);
        clearInterval(interval);
      } else if (state === "failed") {
        console.log("Job failed. Reason:", job.failedReason);
        clearInterval(interval);
      }
    }, 1000); // Check every second
  } catch (error) {
    console.error("Error checking job state:", error);
  }
}
