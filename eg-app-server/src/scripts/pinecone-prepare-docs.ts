import { getPineconeClient } from "src/lib/pinecone-client";
import { embedAndStoreDocs } from "src/lib/vector-store";
import { getChunkedDocsFromPDF } from "src/lib/pdfLoader";

(async () => {
  try {
    const pineconeClient = await getPineconeClient();
    console.log("Preparing chunks from PDF file");
    const docs = await getChunkedDocsFromPDF();
    console.log(`Loading ${docs.length} chunks into pinecone...`);
    await embedAndStoreDocs(pineconeClient, docs);
    console.log("Data embedded and stored in pine-cone index");
  } catch (error) {
    console.error("Init client script failed ", error);
  }
})();