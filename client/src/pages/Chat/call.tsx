import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { AudioCallComponentProps } from "./types";
import { getWaveBlob } from "webm-to-wav-converter";

const AudioCallComponent: React.FC<AudioCallComponentProps> = ({
  callStatus,
  onCallStart,
  onCallEnd,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Initialize WebSocket connection
    const socket = io(`${import.meta.env.VITE_NESTJS_BACKEND_URL}audio`, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnectionStatus("connected");
      console.log("Connected to audio namespace");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
      console.log("Disconnected from audio namespace");
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setConnectionStatus("error");
    });

    socket.on("audio-data", async (data: ArrayBuffer) => {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      try {
        const audioBuffer = await audioContextRef.current.decodeAudioData(data);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.start();
      } catch (err) {
        console.error("Error decoding audio data:", err);
      }
    });

    return () => {
      socket.disconnect();
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
    };
  }, []);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // Recommended for speech
          channelCount: 1    // Mono
        }
      });
      streamRef.current = stream;
      audioContextRef.current = new AudioContext();
  
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
        audioBitsPerSecond: 16000
      });
      mediaRecorderRef.current = mediaRecorder;
  
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && socketRef.current?.connected) {
          try {
            const audioBuffer = await getWaveBlob(event.data,false);
            socketRef.current.emit("audio-message", audioBuffer);
          } catch (error) {
            console.error("Audio conversion error:", error);
            console.log(JSON.stringify(error))
            //playAudioFallback(audioBuffer);
          }
        }
      };
  
      mediaRecorder.start(250);
      setIsRecording(true);
      onCallStart?.();
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const stopCall = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
    setIsMuted(false);
    onCallEnd?.();
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-2">
        {isRecording && (
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full ${
              isMuted ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
            } hover:shadow-md transition-all`}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        )}
        <button
          onClick={isRecording ? stopCall : startCall}
          className={`p-3 rounded-full ${
            isRecording ? "bg-red-500 text-white" : "bg-blue-500 text-white"
          } hover:shadow-md transition-all`}
          aria-label={isRecording ? "End call" : "Start call"}
          disabled={connectionStatus === "error"}
        >
          {isRecording ? <PhoneOff size={20} /> : <Phone size={20} />}
        </button>
      </div>
      <div className="text-xs text-gray-500">
        Status: {connectionStatus}
      </div>
    </div>
  );
};

export default AudioCallComponent;