import { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, Send, Mic, MicOff } from "lucide-react";
import {useChat , Message} from '@ai-sdk/react'
import { CallStatus } from "./types";

export default function Chat() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    data
  } = useChat({
    initialMessages: [],
    api : `${import.meta.env.VITE_NESTJS_BACKEND_URL}chat/ask`,
  });

  useEffect(() => {
    setTimeout(() => {
      
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 100);
  }, [messages, isLoading]);

  const handleCallToggle = () => {
    if (callStatus === "idle") {
      setCallStatus("connecting");
      setTimeout(() => setCallStatus("ongoing"), 1500);
    } else {
      setCallStatus("ended");
      setTimeout(() => setCallStatus("idle"), 1000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="flex justify-between px-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 overflow-hidden rounded-full">
              <img
                src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQRt_Ilbib0KlqN3UAIMd1IQSOYPXVIEtAXGoOkuBk9NFAEKAXHDLLmGnfEWyb-ghS7J0ftNpRM0rhHDDKoedxOZw"
                alt="Barack Obama"
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Barack Obama
              </h1>
              <p className="text-sm text-gray-500">AI Assistant</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {callStatus !== "idle" && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-full ${
                  isMuted
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            )}
            <button
              onClick={handleCallToggle}
              className={`p-2 rounded-full ${
                callStatus !== "idle"
                  ? "bg-red-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              {callStatus !== "idle" ? (
                <PhoneOff size={20} />
              ) : (
                <Phone size={20} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Call status */}
      {callStatus !== "idle" && (
        <div className="py-2 bg-blue-50">
          <div className="px-4 mx-auto">
            <p className="text-sm text-blue-600">
              {callStatus === "connecting"
                ? "Connecting..."
                : callStatus === "ongoing"
                ? "On call with Barack Obama"
                : "Call ended"}
            </p>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 px-4 py-6 overflow-y-auto" ref={containerRef}>
        <div className="space-y-4 ">
          {messages.map((message: Message, index : number) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-900"
                } shadow-sm`}
              >
                <p>{message.content}</p>
                <p className="mt-1 text-xs opacity-75">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white border-t">
        <div className="px-4 py-4 mx-auto ">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
