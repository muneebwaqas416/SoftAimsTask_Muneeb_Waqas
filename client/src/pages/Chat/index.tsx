import { useEffect, useRef, useState } from "react";
import { LogOut, Send } from "lucide-react";
import { useChat, Message } from '@ai-sdk/react';
import { CallStatus } from "./types";
import ReactMarkdown from "react-markdown";
import AudioCallComponent from "./call";
import { deleteCookies, fetchCookieToken, fetchFromCookie } from "@/utils/user.utils";
import { clientApiFetch } from "@/utils/api.utils";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const navigate = useNavigate();

  useEffect(() => {
    async function verifyAuth() {
      const token: string | undefined = fetchCookieToken();
      console.log(token)
      if(token && token!=undefined){
        const res = await clientApiFetch("http://localhost:3000/api/profile", {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (res.error) {
          deleteCookies();
          navigate('/login');
        } 
      }else{
        deleteCookies();
          navigate('/login');
      }
      
      //navigate('/chat')
    }

    verifyAuth();
  },[]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    initialMessages: [],
    api: `${import.meta.env.VITE_NESTJS_BACKEND_URL}chat/ask`,
  });

  useEffect(() => {
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 100);
  }, [messages, isLoading]);

  async function logOut() {
    await deleteCookies();
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
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
          
          <div className="flex items-center space-x-4">
          <AudioCallComponent
              callStatus={callStatus}
              onCallStart={() => setCallStatus("ongoing")}
              onCallEnd={() => setCallStatus("ended")}
            />
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium text-gray-700">
                {fetchFromCookie('username')}
              </span>
              <button 
                onClick={()=>{
                  logOut()
                }}
                className="flex items-center text-gray-500 transition-colors hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto" ref={containerRef}>
        <div className="space-y-4 ">
          {messages.map((message: Message, _) => (
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
                <ReactMarkdown>{message.content}</ReactMarkdown>
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