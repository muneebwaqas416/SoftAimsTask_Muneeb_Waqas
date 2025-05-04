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

const formatMessage = (message: Message) => {
  return `${message.role === "user" ? "Human" : "Assistant"}: ${
    message.content
  }`;
};

@Injectable()
export class ChatService {
  constructor(
    private readonly sttClient: OpenAI,
    private readonly ttsClient: ElevenLabsClient,
  ) {}

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
      // Save the audio data temporarily
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      const tempFilePath = path.join(tempDir, 'audio.webm');
      fs.writeFileSync(tempFilePath, audioData);

      const text = await this.speechToText(tempFilePath);
      console.log(`Transcribed text: ${text}`);
      
      // Get response from the language model
      const textStream = await callChain({ 
        question: text, 
        chatHistory: '' 
      });

      // Process the text stream
      const responseText = await this.processTextStream(textStream.body);
      console.log('Response text:', responseText);
      
      // Convert the response to audio
      const responseAudio = await this.textToSpeech(responseText);
      
      // Clean up temporary file
      fs.unlinkSync(tempFilePath);
      
      // Send the audio back to the client
      socket.emit('audio-data', responseAudio);
    
    } catch (error) {
      console.error('Error processing audio:', error);
      socket.emit('error', 'An error occurred while processing the audio');
    }
  }

  private async speechToText(audioFilePath: string): Promise<string> {
    try {
      // Verify file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error('Audio file does not exist');
    }

    // Get file stats to verify it's not empty
    const stats = fs.statSync(audioFilePath);
    if (stats.size === 0) {
      throw new Error('Audio file is empty');
    }

    // Create read stream with explicit content type if needed
    const fileStream = fs.createReadStream(audioFilePath);
    
    const transcription = await this.sttClient.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
      language: 'en', // optional: specify if you know the language
      response_format: 'text', // or 'json', 'srt', etc.
    });
      return transcription;
    } catch (error) {
      console.error('Speech to text error:', error);
      throw error;
    }
  }

  private async processTextStream(stream: ReadableStream): Promise<string> {
    const reader = stream.getReader();
    let fullText = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      let chunk = new TextDecoder().decode(value);
      
      // Step 1: Remove "0\", "1\", etc., and trailing quotes/newlines
      chunk = chunk.replace(/^"\d+\\"|"$/g, '').trim();
      
      // Step 2: Try parsing as JSON
      try {
        const jsonData = JSON.parse(chunk);
        if (jsonData.text) {
          fullText += jsonData.text;
        }
      } catch (e) {
        // Step 3: If not JSON, clean and add raw text
        const cleanedChunk = chunk
          .replace(/\b([1-9]|10)\b/g, '')  // Remove numbers 1-10
          .replace(/[:"]/g, '');           // Remove colons and quotes
        fullText += cleanedChunk;
      }
    }
    
    return fullText.trim();
  }

  private async textToSpeech(text: string): Promise<Buffer> {
    try {
      const audio = await this.ttsClient.generate({
        text: text,
        output_format: "mp3_44100_128",
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
