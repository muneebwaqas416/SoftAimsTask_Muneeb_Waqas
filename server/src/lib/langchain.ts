import { ConversationalRetrievalQAChain } from "langchain/chains";
import { getVectorStore } from "./vector-store";
import { getPineconeClient } from "./pinecone-client";
import { streamText } from "ai";
import { openai } from '@ai-sdk/openai';
import { streamingModel, nonStreamingModel } from "./llm";
import { STANDALONE_QUESTION_TEMPLATE, QA_TEMPLATE } from "./prompt-template";


type callChainArgs = {
  question: string;
  chatHistory: string;
};

export async function callChain({ question, chatHistory }: callChainArgs) {
  try {
    const sanitizedQuestion = question.trim().replaceAll("\n", " ");
    const pineconeClient = await getPineconeClient();
    const vectorStore = await getVectorStore(pineconeClient);

    const chain = ConversationalRetrievalQAChain.fromLLM(
      streamingModel,
      vectorStore.asRetriever(),
      {
        qaTemplate: QA_TEMPLATE,
        questionGeneratorTemplate: STANDALONE_QUESTION_TEMPLATE,
        returnSourceDocuments: true,
        questionGeneratorChainOptions: {
          llm: nonStreamingModel,
        },
      }
    );

    const res = await chain.call({
      question: sanitizedQuestion,
      chat_history: chatHistory,
    });

    const prompt = res?.text || "Default prompt if res.text is undefined";

    const textStream = streamText({
      model: openai("gpt-4o"),
      prompt,
    });
    return textStream.toDataStreamResponse();
  } catch (e) {
    console.error(e);
    throw new Error("Call chain method failed to execute successfully!!");
  }
}
