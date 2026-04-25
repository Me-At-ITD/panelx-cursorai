import React, { useEffect, useState, useRef } from 'react';
import {
  BotIcon,
  SendIcon,
  PlusIcon,
  MessageSquareIcon,
  ClockIcon,
  ImageIcon,
  XIcon } from
'lucide-react';
interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  image?: string;
}
interface Conversation {
  id: string;
  title: string;
  date: string;
  preview: string;
}
const mockHistory: Conversation[] = [
{
  id: 'c1',
  title: 'Panel count query',
  date: 'Today',
  preview: 'How many panels on floor 5?'
},
{
  id: 'c2',
  title: 'Sync troubleshooting',
  date: 'Yesterday',
  preview: 'Why is Residential Complex C failing to sync?'
},
{
  id: 'c3',
  title: 'Floor 5 status check',
  date: 'Oct 22',
  preview: 'Give me a breakdown of pending panels'
},
{
  id: 'c4',
  title: 'Generate progress report',
  date: 'Oct 20',
  preview: 'Create a summary for Tower A'
},
{
  id: 'c5',
  title: 'Material delivery schedule',
  date: 'Oct 15',
  preview: 'When is the next glass delivery?'
}];

const initialMessages: Message[] = [
{
  id: 'm1',
  role: 'user',
  text: 'Can you give me a summary of the current panel installation progress for Tower A?'
},
{
  id: 'm2',
  role: 'ai',
  text: 'Certainly. For Tower A - Main Facade, overall installation is at 67%. Out of 1,248 total panels, 836 are installed, 380 are pending, and 32 currently have problem statuses reported. The most recent activity was on Floor 12.'
}];

const quickActions = [
'Panel status summary',
'Generate progress report',
'Check sync health',
'Floor-by-floor breakdown'];

export function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeChatId, setActiveChatId] = useState('c1');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isTyping]);
  const handleSend = (text: string) => {
    if (!text.trim() && !selectedImage) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      image: selectedImage || undefined
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: selectedImage ?
        "I've analyzed the image you uploaded. It appears to show a facade installation detail. The bracket alignment looks correct, but I notice the weather sealant application might need attention on the lower edge. Would you like me to log this as a QA issue?" :
        "I've analyzed the project data. Based on the latest sync, everything is proceeding according to schedule. Is there a specific floor or elevation you'd like me to detail?"
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };
  const startNewChat = () => {
    setMessages([]);
    setActiveChatId('new');
  };
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1
        className="font-heading text-2xl font-bold text-text-primary mb-6 uppercase tracking-wide flex-shrink-0"
        style={{
          animation: 'fadeUp 0.35s ease both'
        }}>
        
        AI Assistant
      </h1>

      <div
        className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden"
        style={{
          animation: 'fadeUp 0.35s ease both',
          animationDelay: '100ms'
        }}>
        
        {/* Left Sidebar - History */}
        <div
          className="w-full lg:w-[300px] bg-card-bg border border-border flex flex-col flex-shrink-0"
          style={{
            boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
          }}>
          
          <div className="p-4 border-b border-border">
            <button
              onClick={startNewChat}
              className="btn-primary w-full py-2.5 text-white font-heading text-[12px] font-semibold uppercase tracking-wider flex items-center justify-center gap-2">
              
              <PlusIcon className="w-4 h-4" />
              New Conversation
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <h3 className="font-heading text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-3 px-2">
                Recent Conversations
              </h3>
              <div className="space-y-1">
                {mockHistory.map((chat) =>
                <button
                  key={chat.id}
                  onClick={() => {
                    setActiveChatId(chat.id);
                    if (chat.id === 'c1') {
                      setMessages(initialMessages);
                    } else {
                      setMessages([
                      {
                        id: 'm',
                        role: 'user',
                        text: chat.preview
                      },
                      {
                        id: 'm2',
                        role: 'ai',
                        text: 'This is a mock historical conversation.'
                      }]
                      );
                    }
                  }}
                  className={`w-full text-left p-3 transition-colors ${activeChatId === chat.id ? 'bg-subtle-bg' : 'hover:bg-subtle-bg/50'}`}
                  style={
                  activeChatId === chat.id ?
                  {
                    borderLeft: '3px solid var(--accent)'
                  } :
                  {
                    borderLeft: '3px solid transparent'
                  }
                  }>
                  
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2 text-text-primary">
                        <MessageSquareIcon className="w-3.5 h-3.5 text-text-secondary" />
                        <span className="text-[13px] font-medium truncate">
                          {chat.title}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary pl-6">
                      <ClockIcon className="w-3 h-3" />
                      <span className="text-[10px]">{chat.date}</span>
                    </div>
                    <p className="text-[11px] text-text-secondary mt-1.5 pl-6 truncate">
                      {chat.preview}
                    </p>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Area - Chat */}
        <div
          className="flex-1 bg-card-bg border border-border flex flex-col overflow-hidden relative"
          style={{
            boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
          }}>
          
          {/* Header */}
          <div
            className="h-14 border-b border-border flex items-center px-6 flex-shrink-0"
            style={{
              background: '#0F172A'
            }}>
            
            <div className="flex items-center gap-3">
              <BotIcon className="w-5 h-5 text-[#2E86AB]" />
              <div>
                <span className="font-heading text-[13px] font-bold text-white uppercase tracking-widest">
                  PanelX AI
                </span>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                  Engineering Assistant
                </p>
              </div>
            </div>
          </div>
          <div
            className="h-0.5 flex-shrink-0"
            style={{
              background: 'linear-gradient(90deg, #004a64, #2E86AB)'
            }} />
          

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-subtle-bg">
            {messages.length === 0 ?
            <div className="h-full flex flex-col items-center justify-center max-w-lg mx-auto text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <BotIcon className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-heading text-xl font-bold text-text-primary mb-2">
                  How can I help with your facade project?
                </h2>
                <p className="text-[13px] text-text-secondary mb-8">
                  I can analyze panel data, generate reports, check sync status,
                  and answer questions about your engineering drawings.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {quickActions.map((action) =>
                <button
                  key={action}
                  onClick={() => handleSend(action)}
                  className="p-3 border border-border bg-card-bg text-[12px] text-text-primary hover:border-accent hover:text-accent transition-colors text-left">
                  
                      {action}
                    </button>
                )}
                </div>
              </div> :

            <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg) =>
              <div
                key={msg.id}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                
                    <div className="flex-shrink-0 mt-1">
                      {msg.role === 'ai' ?
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                          <BotIcon className="w-4 h-4" />
                        </div> :

                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-[10px] font-heading font-bold">
                          AD
                        </div>
                  }
                    </div>
                    <div
                  className={`px-4 py-3 text-[13px] leading-relaxed max-w-[80%] ${msg.role === 'user' ? 'text-white' : 'bg-card-bg border border-border text-text-primary'}`}
                  style={
                  msg.role === 'user' ?
                  {
                    background:
                    'linear-gradient(135deg, #006384, #004a64)'
                  } :
                  undefined
                  }>
                  
                      {msg.image &&
                  <img
                    src={msg.image}
                    alt="Uploaded"
                    className="max-w-full h-auto rounded-sm mb-2 max-h-48 object-contain" />

                  }
                      {msg.text}
                    </div>
                  </div>
              )}

                {isTyping &&
              <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0 mt-1">
                      <BotIcon className="w-4 h-4" />
                    </div>
                    <div className="bg-card-bg border border-border px-4 py-4 flex gap-1.5 items-center">
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
            }
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-card-bg flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              {selectedImage &&
              <div className="mb-3 relative inline-block">
                  <img
                  src={selectedImage}
                  alt="Preview"
                  className="h-20 w-auto rounded-sm border border-border" />
                
                  <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-status-problem text-white rounded-full flex items-center justify-center">
                  
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              }
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex gap-3 items-end">
                
                <div className="flex-1 relative">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask PanelX AI anything about your projects..."
                    className="w-full pl-4 pr-12 py-3 border border-border bg-subtle-bg text-[13px] text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-accent transition-colors" />
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload} />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-text-secondary hover:text-accent transition-colors"
                    title="Upload Image">
                    
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() && !selectedImage || isTyping}
                  className="w-12 h-12 flex items-center justify-center text-white disabled:opacity-50 transition-opacity flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #006384, #004a64)'
                  }}>
                  
                  <SendIcon className="w-5 h-5" />
                </button>
              </form>
              <p className="text-[10px] text-text-secondary uppercase tracking-wider text-center mt-3">
                PanelX AI has secure access to your project data and engineering
                files
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);

}