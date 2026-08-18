import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Search, Phone, Video, CheckCheck } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';

export function MessagesPage() {
  const { conversations, activeConversationId, setActiveConversationId, sendMessage } = useData();

  const [inputMsg, setInputMsg] = useState('');
  const [search, setSearch] = useState('');

  const filteredConversations = conversations.filter(c =>
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    c.service.toLowerCase().includes(search.toLowerCase())
  );

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim() || !activeConv) return;
    sendMessage(activeConv.id, inputMsg);
    setInputMsg('');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Real-Time Client Messages" subtitle="Communicate directly with clients, share previews, and negotiate quotes" icon={MessageSquare} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
        {/* Conversation list */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-premium">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="h-10 w-full rounded-xl border border-border bg-cream-50 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[500px] scrollbar-thin">
            {filteredConversations.map((c, i) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setActiveConversationId(c.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors',
                  activeConv?.id === c.id ? 'bg-sage-100/70 border border-sage-200' : 'hover:bg-cream-50 border border-transparent',
                )}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white shadow-sm">
                  {c.avatar}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-dark-900">{c.customerName}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{c.time}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                </div>
                {c.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-sage-600" />}
              </motion.button>
            ))}

            {filteredConversations.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No matching chat conversations.
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {activeConv ? (
          <div className="flex h-[600px] flex-col rounded-2xl border border-border bg-card shadow-premium">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border p-4 bg-muted/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">
                {activeConv.avatar}
              </div>
              <div className="flex-1">
                <p className="font-bold text-dark-900">{activeConv.customerName}</p>
                <p className="text-xs text-sage-700 font-medium">{activeConv.service} · Active Client</p>
              </div>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-dark-600 hover:bg-muted" title="Call">
                <Phone className="h-4 w-4" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-dark-600 hover:bg-muted" title="Video Call">
                <Video className="h-4 w-4" />
              </button>
            </div>

            {/* Messages body */}
            <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin p-4">
              <AnimatePresence>
                {activeConv.messages.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn('flex', m.sender === 'vendor' ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                        m.sender === 'vendor'
                          ? 'bg-sage-600 text-white rounded-br-none'
                          : 'bg-cream-100 text-dark-900 rounded-bl-none border border-border',
                      )}
                    >
                      <p className="leading-relaxed">{m.text}</p>
                      <div className="mt-1 flex items-center justify-end gap-1">
                        <span className={cn('text-[10px]', m.sender === 'vendor' ? 'text-white/80' : 'text-muted-foreground')}>
                          {m.timestamp}
                        </span>
                        {m.sender === 'vendor' && <CheckCheck className="h-3 w-3 text-white/80" />}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Input area */}
            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-4 bg-background">
              <input
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                placeholder="Type your message to client..."
                className="h-11 flex-1 rounded-xl border border-border bg-card px-4 text-sm text-dark-900 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-600 text-white transition-colors hover:bg-sage-700 shadow-sm"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex h-[600px] items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground">
            Select a chat conversation to view messages.
          </div>
        )}
      </div>
    </div>
  );
}
