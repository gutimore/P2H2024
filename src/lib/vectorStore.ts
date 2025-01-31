import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { type Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import fs from "fs";

const formatDocumentsAsString = (documents: Document[]) => {
  console.log(documents);
  return documents.map((document) => document.pageContent).join("\n\n");
};

let vectorStore: MemoryVectorStore | null = null;

export const getVectorStore = async () => {
  if (!vectorStore) {
    const embeddings = new OpenAIEmbeddings({
      apiKey: process.env.NOTEBOOKLM_OPENAI_API_KEY!,
      model: "text-embedding-3-large",
    });
    vectorStore = new MemoryVectorStore(embeddings);

    // Load from persisted JSON if available
    try {
      const data = fs.readFileSync("vectorStore.json", "utf8");
      const memoryVectors = JSON.parse(data);
      console.log("Loading vectors from vectorStore.json");
      await vectorStore.addVectors(
        memoryVectors.map((v) => v.embedding),
        memoryVectors.map((v) => ({
          pageContent: v.content,
          metadata: v.metadata,
        }))
      );
      console.log("Loaded vectors from vectorStore.json");
    } catch (error) {
      console.warn("No persisted vector store found. Starting fresh.");
    }
  }
  return vectorStore;
};

export const addDocumentsToVectorStore = async (
  docs: Document[],
  fileId: string
) => {
  const store = await getVectorStore();

  // Check if documents with the same fileId already exist
  const existingDocs = store.memoryVectors.filter(
    (vector) => vector.metadata?.fileId === fileId
  );

  if (existingDocs.length > 0) {
    console.log(
      `Documents with fileId ${fileId} already exist. Skipping addition.`
    );
    return;
  }

  const enrichedDocs = docs.map((doc) => ({
    ...doc,
    metadata: { ...doc.metadata, fileId },
  }));
  await store.addDocuments(enrichedDocs);

  // Persist vector store
  await persistVectorStore();
};

// export const searchVectorStore = async (query: string) => {
//   const vectorStore = await getVectorStore();

//   console.log("QUERY > ", query);

//   const similaritySearchResults = await vectorStore.similaritySearch(query, 5);

//   return similaritySearchResults.map(
//     (doc) => `* ${doc.pageContent} [${JSON.stringify(doc.metadata.loc, null)}]`
//   );
// };

function replaceSourceReferences(
  text: string,
  sourceList: Record<number, string>
) {
  return text.replace(/\[source:(\d+)\]/g, (match, num) => {
    const href = sourceList[num];
    return href ? `[${num}](${href})` : match; // Retain original if no href found
  });
}

export const askQuestion = async (question: string, fileIds: string[] = []) => {
  console.log("Ask Question > ", question, fileIds);

  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: process.env.NOTEBOOKLM_OPENAI_API_KEY,
  });

  const vectorStore = await getVectorStore();

  // filter out docs by fileId
  const filter = (doc: Document) => {
    return doc.metadata && fileIds.includes(doc.metadata.fileId);
  };

  // retrieve relevant docs
  const relevantDocs = await vectorStore.similaritySearch(question, 20, filter);

  // format retrieved documents
  const sourceList = Object.fromEntries(
    relevantDocs.map((doc, index) => {
      const { fileId, loc } = doc.metadata;
      return [
        index + 1,
        `/source/?fileid=${fileId}&page=${loc.pageNumber}&from=${loc.lines.from}&to=${loc.lines.to}`,
      ];
    })
  );

  // format retrieved documents
  const formattedContext = relevantDocs
    .map((doc, index) => {
      const { fileId, loc } = doc.metadata;
      return `Source [${index + 1}]: (File ID: ${fileId}, Page: ${
        loc.pageNumber
      }, Lines: ${loc.lines.from}-${loc.lines.to})\n${doc.pageContent}`;
    })
    .join("\n\n");

  console.log("formattedContext", formattedContext);

  const SYSTEM_TEMPLATE = `
  Use only the provided context to answer the user's question. 
  For every fact you reference, add an inline citation in the format [source:<number>]. 
  Below are examples of good in-place citations:
  - "According to the findings stated in the first bullet [source:1]..."
  - "Furthermore, the data in the second bullet [source:2] indicates..."
  If you don't know the answer, just say you don't know; don't make it up.
  
  ----------------
  {context}
  `;

  // Create the prompt, making sure it expects both `question` and `context`
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_TEMPLATE],
    ["human", "{question}"],
  ]);

  // Combine everything into a single chain:
  //   1) Pass `formattedContext` to `context`
  //   2) Pass the user's `question`
  //   3) Fill in the prompt
  //   4) Send to the model
  //   5) Return the string output
  const chain = RunnableSequence.from([
    {
      context: new RunnablePassthrough({ func: () => formattedContext }),
      question: new RunnablePassthrough(),
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  // IMPORTANT: pass *both* question and context to `.invoke(...)`
  const answer = await chain.invoke({
    question,
    context: formattedContext,
  });

  const fixedRefs = replaceSourceReferences(answer, sourceList);

  return fixedRefs;
};

export const persistVectorStore = async () => {
  if (!vectorStore) return;
  const data = JSON.stringify(
    vectorStore.memoryVectors.map((v) => ({
      embedding: v.embedding,
      content: v.content,
      metadata: v.metadata,
      id: v.id,
    })),
    null,
    2
  );
  fs.writeFileSync("vectorStore.json", data);
  console.log("Vector store persisted to vectorStore.json");
};
