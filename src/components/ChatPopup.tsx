"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/types/chat";
import { generateChatResponse } from "@/lib/services/chatService";
import { FaComments, FaTimes, FaPaperPlane } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

export default function ChatPopup() {
  // ================================
  // == Variables
  // ================================

  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // ================================
  // == Use Effects
  // ================================

  //
  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  // Scrolling down the chat when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ================================
  // == Functions
  // ================================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      userName: "You",
      message: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await generateChatResponse(inputMessage);
      const botMessage: ChatMessage = {
        ...response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: ChatMessage = {
        userName: "System",
        message: "Sorry, there was an error processing your request.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // If user is not logged in or not a student, don't show the chat
  if (!user || userRole !== "Student") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black hover:bg-gray-800 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-3 hover:shadow-2xl"
      >
        {isOpen ? (
          <FaTimes size={24} className="transform transition-transform hover:rotate-90" />
        ) : (
          <FaComments size={24} className="animate-bounce" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col border border-gray-200 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1">
          {/* Header */}
          <div className="bg-black text-white p-4 rounded-t-lg transition-all duration-300 hover:bg-gray-900">
            <h3 className="text-lg font-semibold hover:scale-105 transform transition-transform cursor-default">
              Chat Support
            </h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 transition-colors duration-300 hover:bg-gray-100">
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.userName === "You" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 ${msg.userName === "You"
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-white text-black border border-gray-200 hover:border-gray-400"
                    }`}
                >
                  <p className="text-sm font-semibold mb-1 transition-all duration-300 hover:scale-105">
                    {msg.userName}
                  </p>

                  {/* Message */}
                  <div className="text-sm transition-all duration-300 hover:text-opacity-90 whitespace-pre-line">
                    {msg.message.split('\\r\\n').map((line, i) => (
                      <p key={i} className="mb-2 last:mb-0">
                        {line}
                      </p>
                    ))}
                  </div>

                  {/* Time  */}
                  {msg.timestamp && (
                    <p
                      className={`text-xs mt-1 transition-all duration-300 ${msg.userName === "You"
                        ? "text-gray-300 hover:text-gray-200"
                        : "text-gray-500 hover:text-gray-600"
                        }`}
                    >
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-gray-200 bg-white transition-all duration-300 hover:bg-gray-50"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 hover:border-gray-400 hover:shadow-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-black hover:bg-gray-800 text-white rounded-lg px-4 py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 group"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaPaperPlane className="transform transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
