import { Injectable } from '@nestjs/common';
import { Message } from "ai";
import { callChain } from 'src/lib/langchain';
import { Response } from 'express';
import { Readable } from 'stream';
import { Socket } from 'socket.io';
import OpenAI from 'openai';
import { ElevenLabsClient } from "elevenlabs";
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

const formatMessage = (message: Message) => {
  return `${message.role === "user" ? "Human" : "Assistant"}: ${
    message.content
  }`;
};

@Injectable()
export class ChatService {
  constructor(
    private readonly ttsClient : ElevenLabsClient,  
    private configService: ConfigService
  ) {
    console.log(this.configService.get<string>('ELEVENLABS_API_KEY'))
    this.ttsClient = new ElevenLabsClient({
      apiKey: this.configService.get<string>('ELEVENLABS_API_KEY'),
    });
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

  async handleAudioData(socket: Socket, text: string): Promise<void> {
    try {
      const textStream = await callChain({ 
        question: text, 
        chatHistory: '' 
      });
      const responseText = await this.processTextStream(textStream.body);
      console.log(responseText)
      const responseAudio = await this.textToSpeech(responseText);
      console.log(responseAudio)
      socket.emit('audio-response', responseAudio);
    } catch (error) {
      console.error('Error processing audio:', error);
      socket.emit('error', 'An error occurred while processing the audio');
    }
  }

  private async processTextStream(stream: ReadableStream): Promise<string> {
    const reader = stream.getReader();
    let fullText = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      let chunk = new TextDecoder().decode(value);
      chunk = chunk.trim();        // Remove `d{...}` wrappers;
      try {
        const jsonData = JSON.parse(chunk);
        if (jsonData.text) {
          fullText += jsonData.text;
        }
      } catch (e) {
        // Step 3: If not JSON, clean and add raw text
        const cleanedChunk = chunk
  .replace(/f\{[^{}]*\}/g, '')            // Remove `f{...}` wrappers
  .replace(/e\{[^{}]*\}/g, '')            // Remove `e{...}` wrappers
  .replace(/d\{[^{}]*\}/g, '')            // Remove `d{...}` wrappers
  .replace(/\b0\b/g, ' ')                 // Replace isolated 0s
  .replace(/(\w)0(?=\W|$)/g, '$1')        // Remove 0 after words
  .replace(/[:"]/g, '')                   // Remove colons and quotes
  .replace(/\s+/g, ' ');                  // Normalize whitespace
        fullText += cleanedChunk;
      }
    }
    
    return fullText.trim();
  }

  private async textToSpeech(text: string): Promise<Buffer> {
    try {
      const elevenlabs = new ElevenLabsClient({
        apiKey: `${this.configService.get<string>('ELEVENLABS_API_KEY')}`, // Defaults to process.env.ELEVENLABS_API_KEY
    });
    
    const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb',{
      output_format: "mp3_44100_128",
    text: text,
    model_id: "eleven_multilingual_v2"
    });
      
      const audioChunks: Buffer[] = [];
      for await (const chunk of audio) {
        audioChunks.push(chunk);
      }
      
      return Buffer.concat(audioChunks);
    } catch (error) {
      console.error('Text to speech error:', error);
      throw error;
    }
  }

}
