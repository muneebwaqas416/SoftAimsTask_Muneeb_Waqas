import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import { Message } from "ai";
import { callChain } from 'src/lib/langchain';
import { Response } from 'express';
import { Readable } from 'stream';
import { Socket } from 'dgram';

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

  async handleAudioData(socket: Socket, audioData: Buffer): Promise<void> {
    try {
      // Step 1: Convert audio to text (using OpenAI Whisper or any STT service)
      const transcribedText = await this.transcribeAudio(audioData);

      // Step 2: Generate AI response
      const aiResponse = await this.generateAIResponse(transcribedText);

      // Step 3: Convert AI text response to speech (TTS)
      const audioResponse = await this.convertTextToSpeech(aiResponse);

      // Send the audio response back to the client (via WebSocket)
      socket.emit('audio-response', audioResponse);
    } catch (error) {
      console.error('Error processing audio:', error);
      socket.emit('error', 'An error occurred while processing the audio');
    }
  }

  // Transcribe the audio (mock implementation for now)
  private async transcribeAudio(audioData: Buffer): Promise<string> {
    // You can integrate OpenAI Whisper, Deepgram, or other services here
    // For now, assume transcription is successful and returns a mock result
    return 'What can I help you with today?';
  }

  
  // Convert text response to speech using Google Cloud TTS
  private async convertTextToSpeech(text: string): Promise<Buffer> {
    const [response] = await this.ttsClient.synthesizeSpeech({
      input: { text },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    });

    return response.audioContent;
  }
}
