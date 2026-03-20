import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, 
  Database, 
  Search, 
  Send, 
  Cpu, 
  Activity, 
  Settings, 
  Github, 
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  MessageSquare,
  Code
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Message, IndexInfo } from "./types";
import { chatWithAssistant } from "./services/gemini";
import { endee } from "./services/endee";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Welcome to the AI Code Assistant. I'm here to help you navigate the Endee vector database repository and build high-performance AI applications. How can I assist you today?",
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [indexes, setIndexes] = useState<IndexInfo[]>([
    { name: "docs_v1", dimension: 1536, metric: "cosine", status: "ready" },
    { name: "codebase_main", dimension: 1536, metric: "cosine", status: "ready" },
  ]);
  const [systemStatus, setSystemStatus] = useState<"ok" | "error" | "loading">("loading");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await endee.getHealth();
        setSystemStatus(health.status === "ok" ? "ok" : "error");
      } catch (error) {
        setSystemStatus("error");
      }
    };
    checkHealth();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatWithAssistant(input, messages);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#E4E3E0] text-[#141414] font-sans">
      {/* Sidebar */}
      <aside className="w-80 border-r border-[#141414] flex flex-col">
        <div className="p-6 border-b border-[#141414] flex items-center gap-3">
          <div className="w-10 h-10 bg-[#141414] flex items-center justify-center rounded-sm">
            <Database className="text-[#E4E3E0] w-6 h-6" />
          </div>
          <div>
            <h1 className="font-mono font-bold text-lg leading-none">ENDEE.IO</h1>
            <span className="text-[10px] uppercase tracking-widest opacity-50">Vector Database</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="col-header">Active Indexes</span>
              <button className="p-1 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors rounded-sm">
                <Plus size={14} />
              </button>
            </div>
            
            <div className="space-y-1">
              {indexes.map((idx) => (
                <div key={idx.name} className="group p-3 border border-transparent hover:border-[#141414] transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="data-value text-sm font-bold">{idx.name}</span>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      idx.status === "ready" ? "bg-emerald-500" : "bg-amber-500"
                    )} />
                  </div>
                  <div className="flex gap-3 text-[10px] opacity-60 uppercase font-mono">
                    <span>DIM: {idx.dimension}</span>
                    <span>METRIC: {idx.metric}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-[#141414] mt-4">
            <span className="col-header mb-4 block">System Metrics</span>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono">CPU LOAD</span>
                <span className="text-xs font-mono">12.4%</span>
              </div>
              <div className="w-full h-1 bg-[#141414]/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#141414] w-[12.4%]" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono">MEM USAGE</span>
                <span className="text-xs font-mono">2.1 GB</span>
              </div>
              <div className="w-full h-1 bg-[#141414]/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#141414] w-[45%]" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#141414] bg-[#141414] text-[#E4E3E0]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity size={14} className={systemStatus === "ok" ? "text-emerald-400" : "text-rose-400"} />
              <span className="text-[10px] font-mono uppercase tracking-widest">
                {systemStatus === "ok" ? "Server Online" : "Server Offline"}
              </span>
            </div>
            <RefreshCw size={12} className="opacity-50 cursor-pointer hover:opacity-100" />
          </div>
          <div className="text-[9px] font-mono opacity-50 truncate">
            v0.4.2-stable | node_01_bengaluru
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 border-b border-[#141414] flex items-center justify-between px-6 bg-[#E4E3E0]/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <Terminal size={18} />
            <span className="font-mono text-sm font-bold">CODE_ASSISTANT_SESSION_01</span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/endee-io/endee" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-mono hover:underline"
            >
              <Github size={14} />
              SOURCE
            </a>
            <div className="h-4 w-[1px] bg-[#141414]/20" />
            <Settings size={16} className="cursor-pointer opacity-60 hover:opacity-100" />
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 max-w-4xl",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-sm flex items-center justify-center shrink-0",
                  msg.role === "user" ? "bg-[#141414]" : "bg-[#141414]/10"
                )}>
                  {msg.role === "user" ? (
                    <span className="text-[#E4E3E0] text-[10px] font-bold">ME</span>
                  ) : (
                    <Cpu size={16} className="text-[#141414]" />
                  )}
                </div>
                
                <div className={cn(
                  "flex flex-col gap-1",
                  msg.role === "user" ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "p-4 rounded-sm text-sm leading-relaxed",
                    msg.role === "user" 
                      ? "bg-[#141414] text-[#E4E3E0]" 
                      : "bg-white border border-[#141414]/10 shadow-sm"
                  )}>
                    <div className="prose prose-sm max-w-none prose-neutral">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline ? (
                              <div className="relative group">
                                <pre className="bg-[#141414] text-[#E4E3E0] p-4 rounded-sm my-2 overflow-x-auto font-mono text-xs">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                                <button 
                                  onClick={() => {
                                    const codeText = Array.isArray(children) ? children.join('') : String(children);
                                    navigator.clipboard.writeText(codeText.replace(/\n$/, ''));
                                  }}
                                  className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 rounded-sm hover:bg-white/20"
                                  title="Copy code"
                                >
                                  <Code size={12} className="text-[#E4E3E0]" />
                                </button>
                              </div>
                            ) : (
                              <code className="bg-[#141414]/10 px-1 rounded-sm font-mono text-xs" {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono opacity-40 uppercase">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-4 max-w-4xl">
              <div className="w-8 h-8 rounded-sm bg-[#141414]/10 flex items-center justify-center animate-pulse">
                <Cpu size={16} className="text-[#141414]/40" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-[#141414] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1 h-1 bg-[#141414] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1 h-1 bg-[#141414] rounded-full animate-bounce" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-[#E4E3E0]">
          <div className="max-w-4xl mx-auto relative">
            <div className="absolute -top-8 left-0 flex gap-2">
              <button 
                onClick={() => setInput("How do I install Endee?")}
                className="text-[10px] font-mono border border-[#141414]/20 px-2 py-1 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all rounded-sm"
              >
                INSTALLATION
              </button>
              <button 
                onClick={() => setInput("Explain the RAG use case.")}
                className="text-[10px] font-mono border border-[#141414]/20 px-2 py-1 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all rounded-sm"
              >
                RAG_PIPELINE
              </button>
              <button 
                onClick={() => setInput("What is the maximum vector capacity?")}
                className="text-[10px] font-mono border border-[#141414]/20 px-2 py-1 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all rounded-sm"
              >
                CAPACITY
              </button>
            </div>
            
            <div className="flex gap-2 p-1 bg-white border border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Query the codebase or documentation..."
                className="flex-1 bg-transparent border-none outline-none px-4 py-3 font-mono text-sm"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-[#141414] text-[#E4E3E0] px-6 flex items-center gap-2 hover:bg-[#141414]/90 transition-colors disabled:opacity-50"
              >
                <Send size={16} />
                <span className="font-mono text-xs font-bold uppercase tracking-widest">Execute</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar - Context Panel */}
      <aside className="w-64 border-l border-[#141414] bg-[#141414]/5 hidden xl:flex flex-col">
        <div className="p-6 border-b border-[#141414]">
          <span className="col-header">Context Analysis</span>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Search size={12} />
              Semantic Match
            </h3>
            <div className="space-y-2">
              <div className="p-2 bg-white border border-[#141414]/10 rounded-sm">
                <div className="text-[10px] font-mono opacity-50 mb-1">docs/getting-started.md</div>
                <div className="text-[11px] line-clamp-2 italic">"Endee is a high-performance vector database designed to handle up to 1B vectors..."</div>
              </div>
              <div className="p-2 bg-white border border-[#141414]/10 rounded-sm opacity-60">
                <div className="text-[10px] font-mono opacity-50 mb-1">README.md</div>
                <div className="text-[11px] line-clamp-2">"Optimized indexing and execution for production AI workloads."</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Activity size={12} />
              Query Performance
            </h3>
            <div className="font-mono text-[10px] space-y-1">
              <div className="flex justify-between">
                <span>LATENCY</span>
                <span className="text-emerald-600">12ms</span>
              </div>
              <div className="flex justify-between">
                <span>TOKENS</span>
                <span>452</span>
              </div>
              <div className="flex justify-between">
                <span>RECALL</span>
                <span>0.98</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#141414]/10">
            <button className="w-full py-2 border border-[#141414] text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0] transition-all flex items-center justify-center gap-2">
              <ExternalLink size={12} />
              Open Dashboard
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
