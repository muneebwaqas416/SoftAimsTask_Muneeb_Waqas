import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { io, Socket } from "socket.io-client";
import SpeechRecognition, { 
  useSpeechRecognition,  
} from 'react-speech-recognition';

interface AudioCallComponentProps {
  callStatus?: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
}

const AudioCallComponent: React.FC<AudioCallComponentProps> = ({
  callStatus,
  onCallStart,
  onCallEnd,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const socketRef = useRef<Socket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Speech recognition hooks
  const {
    transcript,
    listening: isSpeechRecognitionActive,
    resetTranscript,
    browserSupportsSpeechRecognition,
    finalTranscript,
  } = useSpeechRecognition();

  // Initialize socket connection
  useEffect(() => {
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

    socket.on("audio-response", async (audioData: ArrayBuffer) => {
      try {
        const blob = new Blob([audioData], { type: "audio/mpeg" }); // or audio/wav if WAV
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
      } catch (err) {
        console.error("Error playing audio response:", err);
      }
    });    

    return () => {
      socket.disconnect();
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
    };
  }, []);

  // Send final transcript to backend when it changes
  useEffect(() => {
    if (finalTranscript && socketRef.current?.connected) {
      socketRef.current.emit("speech-text", {
        text: finalTranscript,
        timestamp: Date.now()
      });
      resetTranscript(); // Clear for new speech
    }
  }, [finalTranscript, resetTranscript]);

  const startCall = async () => {
    try {
      // Start speech recognition
      resetTranscript();
      SpeechRecognition.startListening({ 
        continuous: true,
        language: 'en-US'
      });
      
      setIsRecording(true);
      onCallStart?.();
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const stopCall = () => {
    // Stop speech recognition
    //SpeechRecognition.stopListening();
    resetTranscript();
    
    setIsRecording(false);
    setIsMuted(false);
    onCallEnd?.();
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (isMuted) {
      // SpeechRecognition.startListening({ 
      //   continuous: true,
      //   language: 'en-US'
      // });
    } else {
      //SpeechRecognition.stopListening();
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="text-red-500">
        Your browser doesn't support speech recognition. Please use Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
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
        Status: {connectionStatus} | 
        Speech Recognition: {isSpeechRecognitionActive ? 'Active' : 'Inactive'} |
        {isMuted ? ' Muted' : ' Unmuted'}
      </div>
      
      <div className="w-full max-w-md p-4 rounded-lg bg-blue-50">
        <h3 className="mb-2 text-sm font-medium">Live Transcription</h3>
        <p className="text-sm">{transcript || 'Waiting for speech...'}</p>
      </div>
    </div>
  );
};

export default AudioCallComponent;