import React, { useEffect, useState, useRef } from 'react';
import { BotIcon, XIcon, MinusIcon, SendIcon, MaximizeIcon } from 'lucide-react';
import { useLanguage } from './LanguageContext';
interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}
const quickActions = [
'HOW MANY PANELS ON FLOOR 5?',
'SYNC STATUS?',
'PENDING ALERTS?'];

const aiResponses: Record<string, string> = {
  'HOW MANY PANELS ON FLOOR 5?':
  'Floor 5 has 48 panels total: 32 installed, 12 pending, and 4 with issues requiring attention.',
  'SYNC STATUS?':
  'All 3 file sync connections are active. Tower A synced 5 min ago, Building B 12 min ago. Residential Complex C has a sync error — last successful sync was 2 hours ago.',
  'PENDING ALERTS?':
  'You have 2 pending alerts: 1 sync failure on Residential Complex C, and 1 panel status conflict on Tower A Floor 3.'
};
export function AIChat() {
  const { direction } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping]);
  const sendMessage = (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const response =
      aiResponses[text] ||
      'I can help you with panel counts, sync status, project progress, and more. Try asking about a specific floor or project.';
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: response
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
  };
  return (
    <>
      {/* FAB */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className={`ai-fab fixed bottom-6 z-[9999] w-14 h-14 flex items-center justify-center text-white hover:scale-105 transition-transform ${direction === 'rtl' ? 'left-6' : 'right-6'}`}
        style={{
          background: 'linear-gradient(135deg, #004a64 0%, #2E86AB 100%)',
          boxShadow:
          '0 4px 20px rgba(0,74,100,0.4), 0 2px 8px rgba(0,0,0,0.15)'
        }}
        aria-label="Open AI Assistant">
        
        <BotIcon className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
      </button>

      {/* Chat Panel */}
      {isOpen &&
      <div
        className={`chat-panel-enter fixed bottom-[76px] z-[9998] w-[360px] flex flex-col bg-card-bg border border-border ${direction === 'rtl' ? 'left-6' : 'right-6'}`}
        style={{
          height: isMinimized ? '56px' : '520px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          transition: 'height 0.3s ease'
        }}
        role="dialog"
        aria-modal="true"
        aria-label="PanelX AI Assistant">
        
          {/* Header */}
          <div
          className="flex items-center justify-between px-4 h-14 flex-shrink-0"
          style={{
            background: '#0F172A'
          }}>
          
            <div className="flex items-center gap-2">
              <img
              src="/logo-light.png"
              alt="Design L.EFRAIM LTD."
              className="h-6 object-contain" />
            
            </div>
            <div className="flex items-center gap-1">
              <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              
                {isMinimized ?
              <MaximizeIcon className="w-3.5 h-3.5" /> :

              <MinusIcon className="w-3.5 h-3.5" />
              }
              </button>
              <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Gradient stripe */}
          <div
          className="h-0.5 flex-shrink-0"
          style={{
            background: 'linear-gradient(90deg, #004a64, #2E86AB)'
          }} />
        

          {!isMinimized &&
        <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-subtle-bg">
                {messages.length === 0 &&
            <div className="space-y-3">
                    <p className="text-[11px] text-text-secondary uppercase tracking-wider font-heading text-center mb-4">
                      Quick Actions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action) =>
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  className="px-3 py-2 border border-border bg-card-bg text-[10px] font-heading uppercase tracking-wider text-text-secondary hover:border-accent hover:text-primary transition-colors">
                  
                          {action}
                        </button>
                )}
                    </div>
                  </div>
            }

                {messages.map((msg) =>
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
                    <div
                className={`max-w-[80%] px-3 py-2.5 text-xs leading-relaxed ${msg.role === 'user' ? 'text-white' : 'bg-card-bg border border-border text-text-primary'}`}
                style={
                msg.role === 'user' ?
                {
                  background:
                  'linear-gradient(135deg, #006384, #004a64)'
                } :
                undefined
                }>
                
                      {msg.text}
                    </div>
                  </div>
            )}

                {isTyping &&
            <div className="flex justify-start">
                    <div className="bg-card-bg border border-border px-4 py-3 flex gap-1.5">
                      {[0, 1, 2].map((i) =>
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  style={{
                    animation: `dotBounce 1s ease infinite ${i * 0.15}s`
                  }} />

                )}
                    </div>
                  </div>
            }
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border p-3 bg-card-bg flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about panels, projects, sync..."
                className="flex-1 px-3 py-2 border border-border bg-subtle-bg text-xs text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-accent" />
              
                  <button
                type="submit"
                className="w-9 h-9 flex items-center justify-center text-white flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #006384, #004a64)'
                }}>
                
                    <SendIcon className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-[9px] text-text-secondary uppercase tracking-wider text-center mt-2">
                  PanelX AI has access to your project data
                </p>
              </div>
            </>
        }
        </div>
      }
    </>);

}