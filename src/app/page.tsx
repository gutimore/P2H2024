import { getVectorStore } from "@/lib/vectorStore";
import App from "./App";

export default async function Page() {
  await getVectorStore();
  return <App />;
}
