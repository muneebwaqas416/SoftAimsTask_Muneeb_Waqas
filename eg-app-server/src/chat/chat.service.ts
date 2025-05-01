import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import { Message } from "ai";
import { callChain } from 'src/lib/langchain';
import { Response } from 'express';
import { Readable } from 'stream';

const formatMessage = (message: Message) => {
  return `${message.role === "user" ? "Human" : "Assistant"}: ${
    message.content
  }`;
};

@Injectable()
export class ChatService {
  constructor() {
  }
  
  async askClone(messages: Message[] , res : Response) {
      console.log("Messages ", messages);
      const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
      const question = messages[messages.length - 1].content;
    
      console.log("Chat history ", formattedPreviousMessages.join("\n"));
    
      if (!question) {
        res.status(400).send({
          message: 'Please provide a message in the request',
        });
        return;
      }
    
      try {
        const streamingTextResponse = await callChain({
          question,
          chatHistory: formattedPreviousMessages.join("\n"),
        });
         // Pipe the streaming response to Express
         res.setHeader('Content-Type', 'text/plain; charset=utf-8');
         res.setHeader('X-Vercel-AI-Data-Stream', 'v1');
   
         // Convert ReadableStream to Node.js Readable
         const reader = streamingTextResponse.body.getReader();
         const nodeStream = new Readable({
           async read() {
             const { done, value } = await reader.read();
             if (done) {
               this.push(null); // End the stream
             } else {
               this.push(Buffer.from(value));
             }
           }
         });
   
         // Pipe to Express response
         return nodeStream.pipe(res);   
      } catch (error) {
          console.log(error)
          res.status(500).send(`An error occurred while processing your request ${error}`);
        }

    
  }
}
