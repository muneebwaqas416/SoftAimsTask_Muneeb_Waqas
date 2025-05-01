import { Pinecone } from '@pinecone-database/pinecone';
import * as path from 'path';
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '../.env') });

let pineconeClientInstance: Pinecone | null = null;

// Initialize index and ready to be accessed.
async function initPineconeClient() {
  try {
    const pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const indexName = process.env.PINECONE_INDEX_NAME;

    const existingIndexes = await pineconeClient.listIndexes();

    if (!existingIndexes.indexes.some(index => index.name === indexName)) {
      console.log(`Creating index: ${indexName}`);
      await pineconeClient.createIndexForModel({
        name: indexName,
        cloud: 'aws', // You can load this from env too if needed
        region: process.env.PINECONE_ENVIRONMENT, // Assuming env.PINECONE_ENVIRONMENT is like 'us-east-1'
        embed: {
          model: 'llama-text-embed-v2', // Or use another model if you want
          fieldMap: { text: 'chunk_text' }, // Adjust according to your use
        },
        waitUntilReady: true,
      });
      console.log("Index created and ready!");
    } else {
      console.log("Your index already exists. Nice!!");
    }

    return pineconeClient;
  } catch (error) {
    console.error("Error initializing Pinecone client", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
}

export async function getPineconeClient() {
  if (!pineconeClientInstance) {
    pineconeClientInstance = await initPineconeClient();
  }
  return pineconeClientInstance;
}
