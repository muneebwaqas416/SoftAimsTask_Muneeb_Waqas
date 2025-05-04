import { Injectable } from '@nestjs/common';
import { Message } from "ai";
import { callChain } from 'src/lib/langchain';
import { Response } from 'express';
import { Readable } from 'stream';
import { Socket } from 'socket.io';
import OpenAI from 'openai';
import { ElevenLabsClient, play } from "elevenlabs";

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
  ) {
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
      console.log(audioData)
      if (!audioData.slice(0, 4).equals(Buffer.from('RIFF'))) {
        throw new Error('Invalid WAV file format');
      }
    
      const text = await this.speechToText(audioData);
      console.log(`${text} which I am recieiving from my functions`)
    const textStream = await callChain({ 
      question: text, 
      chatHistory: '' 
    });
    console.log(typeof textStream.body)
    const audioBuffer = await this.streamToAudio(textStream.body);

      socket.emit('audio-data', audioBuffer);
    
    } catch (error) {
      console.error('Error processing audio:', error);
      socket.emit('error', 'An error occurred while processing the audio');
    }
  }

  private async speechToText(audio: Buffer): Promise<string> {
    const fs = require('fs');
    fs.writeFileSync('debug_audio.wav', audio);
    
    console.log(`Received audio buffer size: ${audio.length} bytes`);
    
    try {
      const transcription = await this.sttClient.audio.transcriptions.create({
        file: new File([audio], 'debug_audio.wav', { type: 'audio/wav' }),
        model: 'whisper-1',
      });
      return transcription.text;
    } catch (error) {
      console.error('Full error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  private async streamToAudio(textStream:ReadableStream ): Promise<Buffer> {
    try {
      const reader = textStream.getReader();
      const textChunks = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textChunks.push(new TextDecoder().decode(value));
      }
  
      const fullText = textChunks.join('');
      console.log('Text generation complete:', fullText);
      // 3. Generate audio from ElevenLabs
      const audio = await this.ttsClient.generate({
        text: fullText,
       output_format: "mp3_44100_128",
       model_id: "eleven_multilingual_v2"
      });
  
      const audioChunks: Buffer[] = [];
         for await (const chunk of audio) {
           audioChunks.push(chunk);
         }
         console.log('Audio generation complete');
         return Buffer.concat(audioChunks);
    } catch (error) {
      console.error('Error in streamToAudio:', error);
      throw new Error(`Audio conversion failed: ${error.message}`);
    }
  }

}
