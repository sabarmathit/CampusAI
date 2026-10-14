import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { AcademicService } from '../../services/academicService';
import { AIService, ChatMessage } from '../../services/aiService';
import { AI_AGENTS } from '../../data/mockData';
import { AIAgent } from '../../types';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  RefreshCw,
  Lightbulb,
  Info,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const AIAssistantView: React.FC = () => {
  const { currentUser } = useAuth();

  // Select initial agent appropriate for current role
  const getInitialAgent = (): AIAgent => {
    if (!currentUser) return AI_AGENTS[0];
    if (currentUser.role === 'faculty') {
      return AI_AGENTS.find(a => a.id === 'agent-faculty') || AI_AGENTS[0];
    }
    if (currentUser.role === 'recruiter') {
      return AI_AGENTS.find(a => a.id === 'agent-recruiter') || AI_AGENTS[0];
    }
    return AI_AGENTS.find(a => a.id === 'agent-placement') || AI_AGENTS[0];
  };

  const [activeAgent, setActiveAgent] = useState<AIAgent>(getInitialAgent);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!currentUser) return null;

  // Initialize agent welcome message when agent changes
  useEffect(() => {
    setMessages([
      {
        id: `msg-welcome-${activeAgent.id}`,
        sender: 'agent',
        agentId: activeAgent.id,
        text: activeAgent.welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [activeAgent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
    if (!q || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Retrieve full context for AI engine
    const context = {
      currentUser,
      allUsers: StorageService.getUsers(),
      jobs: StorageService.getJobPosts(),
      assignments: StorageService.getAssignments(),
      applications: StorageService.getApplications(),
      attendance: StorageService.getAttendance(),
      internalMarks: StorageService.getInternalMarks(),
      semesterMarks: StorageService.getSemesterMarks(),
      placementDrives: StorageService.getPlacementDrives(),
      projects: StorageService.getProjects()
    };

    try {
      const responseText = await AIService.generateAgentResponse(q, context, messages);

      const agentMsg: ChatMessage = {
        id: `msg-agent-${Date.now()}`,
        sender: 'agent',
        agentId: activeAgent.id,
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error('AI Assistant Error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Multi-Agent Architecture Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Multi-Agent Autonomous Campus Intelligence
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Domain-specialized AI agent swarm orchestrating academic advisory, recruiter candidate screening, rubric generation, and placement drive eligibility.
            </p>
          </div>

          {/* Demonstration Notice Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs">
            <Info className="w-4 h-4 shrink-0 text-blue-600" />
            <span>Simulated multi-agent runtime for project demo. FastAPI / Gemini API ready.</span>
          </div>
        </div>

        {/* Agent Selector Bar */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-100">
          {AI_AGENTS.map(agent => {
            const isActive = activeAgent.id === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => setActiveAgent(agent)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'border-purple-300 bg-purple-50/70 shadow-xs ring-1 ring-purple-200'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    agent.id === 'agent-placement' ? 'bg-purple-600' :
                    agent.id === 'agent-academic' ? 'bg-blue-600' :
                    agent.id === 'agent-faculty' ? 'bg-emerald-600' : 'bg-amber-600'
                  }`} />
                  <span className="text-xs font-bold text-slate-900 truncate block">
                    {agent.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-1">
                  {agent.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Conversation Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-[520px]">
        {/* Chat Header */}
        <div className="p-3.5 px-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 leading-tight">
                {activeAgent.name}
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-md">
                {activeAgent.specialty}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setMessages([
                {
                  id: `msg-welcome-${activeAgent.id}`,
                  sender: 'agent',
                  agentId: activeAgent.id,
                  text: activeAgent.welcomeMessage,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Reset conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map(msg => {
            const isAgent = msg.sender === 'agent';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isAgent ? '' : 'flex-row-reverse'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isAgent ? 'bg-purple-100 text-purple-700' : 'bg-slate-900 text-white'
                }`}>
                  {isAgent ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                </div>

                <div className={`max-w-xl rounded-xl p-3.5 text-xs leading-relaxed space-y-1 ${
                  isAgent 
                    ? 'bg-slate-50 border border-slate-200 text-slate-800' 
                    : 'bg-blue-600 text-white'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div className={`text-[10px] text-right font-mono ${isAgent ? 'text-slate-400' : 'text-blue-200'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <Bot className="w-4 h-4 text-purple-600 animate-spin" />
              <span>{activeAgent.name} is formulating multi-agent response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Pill Strip */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="text-[11px] font-semibold text-slate-500 shrink-0">Prompts:</span>
          {activeAgent.suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 hover:border-purple-300 hover:text-purple-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Query Input Box */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Ask ${activeAgent.role} about courses, eligibility, interview prep, rubrics...`}
              className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || isTyping}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
