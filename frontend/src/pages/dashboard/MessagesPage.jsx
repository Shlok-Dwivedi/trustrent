import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { Send, Loader2, MessageSquare, User, Home, ChevronLeft } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Avatar({ name, size = 'md' }) {
  const cls = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base';
  return (
    <div className={`${cls} rounded-full bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Conversation List Item ────────────────────────────────────────────────────
function ConvoItem({ convo, isActive, onClick, myId }) {
  const isMeSender = convo.sender_id === myId;
  const other = isMeSender ? convo.receiver : convo.sender;
  const otherName = other?.name || (isMeSender ? 'Recipient' : 'Sender') || 'Unknown User';
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${isActive ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
    >
      <Avatar name={other?.name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-gray-900'}`}>
          {otherName}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{convo.content}</p>
      </div>
      <span className="text-[10px] text-gray-400 flex-shrink-0">{formatTime(convo.created_at)}</span>
    </button>
  );
}

// ─── Chat Bubble ──────────────────────────────────────────────────────────────
function Bubble({ msg, isMine }) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
        isMine
          ? 'bg-primary text-white rounded-br-md'
          : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md'
      }`}>
        <p>{msg.content}</p>
        <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60 text-right' : 'text-gray-400'}`}>
          {formatTime(msg.created_at)}
        </p>
      </div>
    </div>
  );
}

// ─── Main Messages Page ───────────────────────────────────────────────────────
export default function MessagesPage() {
  const { user } = useAuthStore();

  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  // ── Load conversations ───────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const res = await axios.get('/api/messages/conversations');
      setConversations(res.data?.data?.conversations || []);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoadingConvos(false);
    }
  }, []);

  useEffect(() => { if (user) loadConversations(); }, [user, loadConversations]);

  // ── Load messages for active conversation ────────────────────────────────
  const loadMessages = useCallback(async (convId) => {
    if (!convId) return;
    setLoadingMsgs(true);
    try {
      const res = await axios.get(`/api/messages/${convId}`);
      setMessages(res.data?.data?.messages || []);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  // Poll active conversation every 5s
  useEffect(() => {
    if (!activeConvo) return;
    loadMessages(activeConvo.conversation_id);
    pollRef.current = setInterval(() => loadMessages(activeConvo.conversation_id), 5000);
    return () => clearInterval(pollRef.current);
  }, [activeConvo, loadMessages]);


  // ── Select conversation ──────────────────────────────────────────────────
  const selectConvo = (convo) => {
    setActiveConvo(convo);
    setMobileView('chat');
  };

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConvo || sending) return;

    const isMeSender = activeConvo.sender_id === user?.id;
    const receiverId = isMeSender ? activeConvo.receiver_id : activeConvo.sender_id;

    setSending(true);
    try {
      await axios.post('/api/messages/', {
        receiver_id: receiverId,
        content: text.trim(),
      });
      setText('');
      await loadMessages(activeConvo.conversation_id);
      await loadConversations();
    } catch (err) {
      const errorMsg = err.response?.data?.message || t('common.error');
      toast.error(errorMsg);
    } finally {
      setSending(false);
    }
  };

  const activeOther = activeConvo
    ? (activeConvo.sender_id === user?.id ? activeConvo.receiver : activeConvo.sender)
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-gray-900">{t('nav.messages')}</h1>
        <p className="text-gray-500 mt-1">{t('messages.subtitle')}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">

          {/* ── Sidebar: Conversations ────────────────────────────────── */}
          <div className={`w-full sm:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col ${mobileView === 'chat' ? 'hidden sm:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">{t('messages.subtitle')}</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingConvos ? (
                <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">{t('messages.no_convos')}</p>
                  <p className="text-xs mt-1">{t('messages.cta')}</p>
                </div>
              ) : (
                conversations.map(c => (
                  <ConvoItem
                    key={c.conversation_id}
                    convo={c}
                    myId={user?.id}
                    isActive={activeConvo?.conversation_id === c.conversation_id}
                    onClick={() => selectConvo(c)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Main: Chat Window ─────────────────────────────────────── */}
          <div className={`flex-1 flex flex-col h-full ${mobileView === 'list' ? 'hidden sm:flex' : 'flex'}`}>
            {activeConvo ? (
              <>
                {/* Chat Header */}
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                  <button
                    className="sm:hidden p-1 rounded-full hover:bg-gray-200 transition-colors"
                    onClick={() => setMobileView('list')}
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                  </button>
                  <Avatar name={activeOther?.name || (activeConvo.sender_id === user?.id ? 'Recipient' : 'Sender')} size="sm" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{activeOther?.name || (activeConvo.sender_id === user?.id ? 'Recipient' : 'Sender')}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50/30">
                  {loadingMsgs ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-12 text-sm">{t('messages.no_messages')}</div>
                  ) : (
                    messages.map(msg => (
                      <Bubble key={msg.id} msg={msg} isMine={msg.sender_id === user?.id} />
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="px-4 py-3 border-t border-gray-100 flex gap-3 items-center bg-white">
                  <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder={t('messages.type_placeholder')}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim() || sending}
                    className="p-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                <MessageSquare className="w-16 h-16 text-gray-200" />
                <p className="text-lg font-semibold text-gray-300">{t('messages.select_convo')}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
