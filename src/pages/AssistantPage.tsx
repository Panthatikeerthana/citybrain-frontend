import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  RotateCcw, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Zap,
  Loader2
} from 'lucide-react';
import { AssistantMessage } from '../types';
import { sendAiMessage } from '../services/aiService';

const INITIAL_MESSAGE: AssistantMessage = {
  id: 'msg-welcome',
  sender: 'assistant',
  content: `Hello! I am City Brain AI — an intelligent urban management and predictive decision assistant for Greater Hyderabad.\n\nI combine Google Gemini generative reasoning with live MySQL telemetry spanning Traffic congestion, Weather, Emergency dispatches, Water distribution, Solid waste, Air Quality (AQI), Citizen complaints, and Predictive risks.\n\nHow can I assist your command operations today?`,
  timestamp: 'Just now',
  suggestedFollowups: [
    'Which areas have high traffic?',
    'What are the major urban risks?',
    'Which complaints need urgent attention?',
    'How can the city reduce waste?',
    'What should authorities do during a severe emergency?',
    'Analyze the current pollution records in Hyderabad.',
    "Summarize today's available City Brain data."
  ],
};

export const AssistantPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([INITIAL_MESSAGE]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    setErrorMessage(null);

    const userMsg: AssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await sendAiMessage(query);

      const assistantMsg: AssistantMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowups: [
          'Which areas have high traffic?',
          'What are the major urban risks?',
          'Summarize today\'s available City Brain data.'
        ],
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errText = err?.message || 'Unable to connect to City Brain AI backend. Please verify your connection.';
      setErrorMessage(errText);

      const fallbackMsg: AssistantMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: `⚠️ **City Brain AI Notice:** ${errText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setErrorMessage(null);
    setInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#173D35] text-white flex items-center justify-center shadow-sm">
              <Bot className="w-6 h-6 text-[#188568]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#202B29] tracking-tight flex items-center gap-2">
                <span>City Brain AI Assistant</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#188568]/10 text-[#188568] border border-[#188568]/20">
                  Phase 3 • Gemini Powered
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[#697773] mt-0.5">
                Intelligent urban command and prediction agent connected to MySQL persistence & Google Gemini.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#697773] hover:text-[#202B29] bg-[#F7F8F5] hover:bg-[#E1E7E2] border border-[#E1E7E2] rounded-lg transition-all shadow-sm"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#188568] bg-[#188568]/10 border border-[#188568]/20 px-3 py-2 rounded-lg shrink-0">
            <Sparkles className="w-4 h-4 text-[#188568]" />
            <span className="hidden md:inline">Gemini & MySQL Ground Truth</span>
            <span className="md:hidden">AI Active</span>
          </div>
        </div>
      </div>

      {/* Main Chat View */}
      <div className="bg-white rounded-xl border border-[#E1E7E2] shadow-sm overflow-hidden flex flex-col h-[680px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#188568] text-white'
                    : 'bg-[#173D35] text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Content */}
              <div className="space-y-2 flex-1">
                <div
                  className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed border ${
                    msg.sender === 'user'
                      ? 'bg-[#188568] border-[#188568] text-white rounded-tr-none shadow-sm'
                      : 'bg-[#F7F8F5] border-[#E1E7E2] text-[#202B29] rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-line font-sans leading-relaxed">
                    {msg.content}
                  </div>
                  <div
                    className={`text-[10px] font-mono mt-2 pt-1 border-t flex items-center justify-between ${
                      msg.sender === 'user' 
                        ? 'border-white/20 text-white/80' 
                        : 'border-[#E1E7E2] text-[#697773]'
                    }`}
                  >
                    <span>{msg.sender === 'user' ? 'Operator' : 'City Brain AI'}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Suggested Followups */}
                {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedFollowups.map((f, idx) => (
                      <button
                        key={idx}
                        disabled={isTyping}
                        onClick={() => handleSendMessage(f)}
                        className="px-3 py-1.5 bg-white hover:bg-[#F7F8F5] border border-[#E1E7E2] hover:border-[#188568]/50 rounded-full text-xs text-[#202B29] hover:text-[#188568] transition-all font-sans text-left shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        💡 {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-xl mr-auto animate-fadeIn">
              <div className="w-9 h-9 rounded-xl bg-[#173D35] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-5 h-5 animate-pulse text-[#188568]" />
              </div>
              <div className="p-4 bg-[#F7F8F5] border border-[#E1E7E2] rounded-xl rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#188568] animate-spin" />
                <span className="text-xs text-[#697773] font-medium font-sans">
                  Querying MySQL context & synthesizing Gemini intelligence...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error notification bar if present */}
        {errorMessage && (
          <div className="px-4 py-2.5 bg-red-50 border-t border-red-200 flex items-center justify-between text-xs text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="font-bold underline hover:text-red-900 ml-4 text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 bg-[#F7F8F5] border-t border-[#E1E7E2]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={2}
                placeholder="Ask City Brain AI (e.g., 'Which areas have high traffic?' or 'What are the major urban risks?')..."
                value={input}
                disabled={isTyping}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-white border border-[#E1E7E2] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568] transition-all font-sans resize-none disabled:bg-[#F7F8F5]"
              />
              <div className="absolute right-3 bottom-2.5 text-[10px] text-[#697773] font-mono pointer-events-none hidden sm:block">
                Press Enter to send • Shift+Enter for new line
              </div>
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`p-3.5 rounded-xl transition-all shrink-0 flex items-center justify-center ${
                input.trim() && !isTyping
                  ? 'bg-[#188568] hover:bg-[#11654F] text-white cursor-pointer shadow-sm active:scale-95'
                  : 'bg-[#E1E7E2] text-[#697773] cursor-not-allowed'
              }`}
              title="Send message"
            >
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-[#697773] font-mono mt-2.5 px-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#188568]" />
              Secure Server Proxy (`/api/ai/chat`)
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              15 requests/min limit
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
