import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { AudioCallComponentProps } from "./types";
import { io, Socket } from "socket.io-client";

const AudioCallComponent: React.FC<AudioCallComponentProps> = ({
  callStatus,
  onCallStart,
  onCallEnd,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    socketRef.current = io("https://your-backend-url", {
      transports: ["websocket"],
    });

    socketRef.current.on("audio-data", async (data: ArrayBuffer) => {
      if (audioContextRef.current) {
        try {
          const audioBuffer = await audioContextRef.current.decodeAudioData(data);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContextRef.current.destination);
          source.start();
        } catch (err) {
          console.error("Error decoding audio data:", err);
        }
      }
    });

    return () => {
      socketRef.current?.disconnect();
      audioContextRef.current?.close();
    };
  }, []);

  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    audioContextRef.current = new AudioContext();
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("audio-data", event.data);
      }
    };

    mediaRecorder.start(250);
    setIsRecording(true);
    onCallStart?.();
  };

  const stopCall = () => {
    mediaRecorderRef.current?.stop();
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
    }
    setIsMuted((prev) => !prev);
  };

  return (
    <div>
      <div className="flex items-center space-x-2">
        {isRecording && (
          <button
            onClick={toggleMute}
            className={`p-2 rounded-full ${
              isMuted ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
            }`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        )}
        <button
          onClick={isRecording ? stopCall : startCall}
          className={`p-2 rounded-full ${
            isRecording ? "bg-red-500 text-white" : "bg-blue-500 text-white"
          }`}
        >
          {isRecording ? <PhoneOff size={20} /> : <Phone size={20} />}
        </button>
      </div>
    </div>
  );
};

export default AudioCallComponent;
