import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';
import { askAiChat } from '../api/educatorService';
import { toast } from '../utils/toast';

const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your Beauty AI Assistant. Ask me anything about our courses, beauty products, or how to get started on FashionFever!',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessageText = inputText.trim();
    setInputText('');
    
    // Add user message to state
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessageText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await askAiChat({ query: userMessageText });
      
      if (response?.success) {
        let replyText = '';
        if (response.data) {
          if (typeof response.data === 'string') {
            replyText = response.data;
          } else if (response.data.reply && typeof response.data.reply === 'string') {
            replyText = response.data.reply;
          } else if (response.data.message && typeof response.data.message === 'string') {
            replyText = response.data.message;
          } else {
            replyText = JSON.stringify(response.data);
          }
        } else {
          replyText = 'I am sorry, I did not receive a proper response.';
        }

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: replyText,
          timestamp: new Date()
        }]);
      } else {
        const errMsg = response?.message || 'Sorry, I encountered an issue connecting to the assistant. Please try again.';
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg),
          timestamp: new Date()
        }]);
      }
    } catch (err) {
      console.error('AI Chat Widget error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'An error occurred. Please check your internet connection and try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-[500] font-outfit">
      {/* Chat Window Popup */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[380px] h-[500px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-150 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-pink-500 text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-white shadow-inner relative">
                <Sparkles size={18} className="animate-pulse" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider">Beauty AI Assistant</h3>
                <span className="text-[10px] text-pink-100 font-semibold uppercase tracking-wider block">Online & Ready</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all cursor-pointer text-white hover:rotate-90 duration-300"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`p-3 text-xs leading-relaxed max-w-[85%] whitespace-pre-line shadow-xs ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-white rounded-2xl rounded-tr-none font-bold' 
                      : 'bg-white text-gray-700 border border-gray-150 rounded-2xl rounded-tl-none font-semibold'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="bg-white text-gray-400 border border-gray-150 rounded-2xl rounded-tl-none p-3 shadow-xs flex items-center gap-1.5 text-xs font-bold">
                  <Loader2 size={12} className="animate-spin text-primary" />
                  <span>Beauty AI is typing...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Area */}
          <form 
            onSubmit={handleSendMessage}
            className="p-3 border-t border-gray-150 bg-white flex gap-2 items-center"
          >
            <input
              type="text"
              required
              disabled={isLoading}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask Beauty AI anything..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-250 text-xs font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-gray-800"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-primary to-pink-500 text-white rounded-full shadow-[0_10px_30px_rgba(252,155,201,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer group relative"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        
        {/* Glow pulsing ring when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping z-[-1]" />
        )}
        
        {/* Tooltip helper when closed */}
        {!isOpen && (
          <div className="absolute right-full mr-4 bg-white px-3 py-2 rounded-xl shadow-xl text-[10px] font-black uppercase text-gray-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none border border-gray-150 tracking-wider">
            Chat with Beauty AI
          </div>
        )}
      </button>
    </div>
  );
};

export default AiChatWidget;
