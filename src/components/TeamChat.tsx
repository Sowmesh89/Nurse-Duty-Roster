import React, { useState } from 'react';
import { TeamMessage, Nurse } from '../types/roster';
import { 
  Send, 
  AlertCircle, 
  MessageSquare, 
  ShieldCheck, 
  Flame, 
  Check, 
  ClipboardCheck,
  Users
} from 'lucide-react';

interface TeamChatProps {
  messages: TeamMessage[];
  onSendMessage: (content: string, channel: TeamMessage['channel'], urgent?: boolean) => void;
  currentNurse: Nurse;
  onTakeShiftCover?: (note: string) => void;
}

export const TeamChat: React.FC<TeamChatProps> = ({
  messages,
  onSendMessage,
  currentNurse,
  onTakeShiftCover,
}) => {
  const [activeChannel, setActiveChannel] = useState<TeamMessage['channel']>('icu_general');
  const [inputText, setInputText] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const filteredMessages = messages.filter((m) => m.channel === activeChannel);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), activeChannel, isUrgent);
    setInputText('');
    setIsUrgent(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row h-[600px] overflow-hidden">
      {/* Left Sidebar: Channels */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 p-3 flex flex-col justify-between">
        <div className="space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Clinical Team Channels
            </h3>
            <p className="text-[11px] text-slate-500">Kauvery Critical Care ICU</p>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveChannel('icu_general')}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors flex items-center justify-between ${
                activeChannel === 'icu_general'
                  ? 'bg-teal-800 text-white shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                # ICU General
              </span>
              <span className="text-[10px] opacity-75 font-mono">Ward 4</span>
            </button>

            <button
              onClick={() => setActiveChannel('shift_handovers')}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors flex items-center justify-between ${
                activeChannel === 'shift_handovers'
                  ? 'bg-teal-800 text-white shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5" />
                # Shift Handovers (SBAR)
              </span>
              <span className="text-[10px] opacity-75 font-mono">Clinical</span>
            </button>

            <button
              onClick={() => setActiveChannel('urgent_swaps')}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors flex items-center justify-between ${
                activeChannel === 'urgent_swaps'
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'text-rose-900 bg-rose-50/60 hover:bg-rose-100/60'
              }`}
            >
              <span className="flex items-center gap-1.5 font-bold">
                <Flame className="w-3.5 h-3.5" />
                # Urgent Shift Cover
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            </button>
          </div>
        </div>

        {/* Current sender info */}
        <div className="pt-3 border-t border-slate-200 text-xs">
          <span className="text-slate-400 block text-[10px]">Logged in as:</span>
          <div className="font-semibold text-slate-800 truncate">{currentNurse.name}</div>
          <div className="text-[10px] text-teal-700 font-mono">ID: {currentNurse.id} · {currentNurse.role}</div>
        </div>
      </div>

      {/* Right: Message Stream */}
      <div className="flex-1 flex flex-col justify-between h-full bg-white">
        {/* Stream Header */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              {activeChannel === 'icu_general' && '# ICU General Communications'}
              {activeChannel === 'shift_handovers' && '# Shift Handovers & SBAR Clinical Notes'}
              {activeChannel === 'urgent_swaps' && '# Urgent Shift Cover Broadcasts'}
            </h4>
            <span className="text-[11px] text-slate-500">
              Encrypted hospital internal channel · Logged for clinical continuity
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Real-Time Connected
          </span>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {filteredMessages.map((msg) => {
            const isMe = msg.senderId === currentNurse.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-xl ${isMe ? 'ml-auto' : ''}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[11px]">
                  <span className="font-bold text-slate-900">{msg.senderName}</span>
                  <span className="text-slate-400 font-mono">· {msg.senderRole}</span>
                  <span className="text-slate-400 font-mono">· {msg.timestamp}</span>
                </div>

                <div
                  className={`p-3 rounded-xl text-xs space-y-1.5 ${
                    msg.urgent
                      ? 'bg-rose-50 border border-rose-200 text-rose-950 font-medium'
                      : isMe
                      ? 'bg-teal-800 text-white'
                      : 'bg-slate-100 text-slate-900 border border-slate-200/60'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                  {/* 1-Click Action for urgent cover requests */}
                  {msg.urgent && activeChannel === 'urgent_swaps' && (
                    <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-rose-700 font-mono">Overtime / Comp Off applicable</span>
                      <button
                        onClick={() => {
                          if (onTakeShiftCover) onTakeShiftCover(msg.id);
                          onSendMessage(`I am volunteer to cover this shift! Confirmed by ${currentNurse.name}.`, 'urgent_swaps');
                        }}
                        className="px-2.5 py-1 bg-rose-700 text-white rounded text-[11px] font-bold hover:bg-rose-800 transition-colors shadow-2xs"
                      >
                        I'll Take This Shift!
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Send message to #${activeChannel}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-teal-800 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors flex items-center gap-1.5 shadow-2xs shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span className={isUrgent ? 'text-rose-700 font-bold' : ''}>
                Mark as High Priority / Urgent
              </span>
            </label>
            <span className="font-mono text-[10px]">SBAR Format Recommended for Handovers</span>
          </div>
        </form>
      </div>
    </div>
  );
};
