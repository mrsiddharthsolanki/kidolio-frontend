import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '@/lib/utils';
// For emoji picker
// import EmojiPicker from 'emoji-picker-react'; // Uncomment if using a package

interface FriendProfile {
  _id: string;
  name: string;
  role: string;
}

interface Message {
  _id?: string;
  from: string;
  to: string;
  content: string;
  createdAt?: string;
  status?: 'sent' | 'delivered' | 'read';
}

const ChatWindow: React.FC<{ friend: FriendProfile; onOpenProfile?: (friend: FriendProfile) => void }> = ({ friend, onOpenProfile }) => {
  const { user } = useAuth();
  const { socket, sendMessage, onlineUsers, sendTyping } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [deliveredIds, setDeliveredIds] = useState<string[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingState = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Refactor fetch messages logic
  const fetchMessages = async () => {
    if (!user) return;
    const apiUrl = import.meta.env.DEV ? `http://localhost:5000/api/message/${friend._id}` : `/api/message/${friend._id}`;
    const res = await fetch(apiUrl, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('kidolio-token')}` }
    });
    const msgs = await res.json();
    const normalizedMsgs = msgs.map(m => ({ ...m, from: m.from?.toString(), to: m.to?.toString() }));
    // Remove duplicates by _id and by content+from+to+createdAt (rounded to 2s)
    const uniqueById = Array.from(new Map(normalizedMsgs.map(m => [m._id, m])).values());
    const seen = new Set();
    const uniqueMsgs = uniqueById.filter(m => {
      // Round createdAt to nearest 2 seconds
      const createdAt = m.createdAt ? Math.round(new Date(m.createdAt).getTime() / 2000) : 0;
      const key = `${m.from}|${m.to}|${m.content}|${createdAt}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setMessages(uniqueMsgs);
    // Mark all as delivered if friend is online
    if (onlineUsers.includes(friend._id)) {
      setDeliveredIds(uniqueMsgs.filter((m: Message) => m.to === friend._id).map((m: Message) => m._id).filter(Boolean));
    }
    // Mark all as read if chat is open and friend is online
    setReadIds(uniqueMsgs.filter((m: Message) => m.from === friend._id).map((m: Message) => m._id).filter(Boolean));
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, [friend, user, onlineUsers]);

  // Helper to update a message by tempId or _id
  const updateMessageId = (tempId, realId) => {
    setMessages(prev => prev.map(m => (m._id === tempId ? { ...m, _id: realId } : m)));
  };

  // Listen for delivery and read receipts from backend and update ticks
  useEffect(() => {
    if (!socket) return;
    // Listen for delivery receipts
    const deliveredHandler = ({ messageId }) => {
      setDeliveredIds(prev => prev.includes(messageId) ? prev : [...prev, messageId]);
    };
    // Listen for read receipts
    const readHandler = ({ from, to }) => {
      // Mark all messages from user to friend as read
      setReadIds(prev => {
        const newRead = messages.filter(m => m.from === user?.id && m.to === friend._id && m._id).map(m => m._id!);
        return Array.from(new Set([...prev, ...newRead]));
      });
    };
    // Listen for message confirmation from backend
    const receiveMessageHandler = (msg) => {
      // Normalize all IDs to string
      const msgFrom = msg.from?.toString();
      const msgTo = msg.to?.toString();
      const userId = user?.id?.toString();
      const friendId = friend._id?.toString();
      // Only handle messages for the current chat (either sent or received)
      if ((msgFrom === userId && msgTo === friendId) || (msgFrom === friendId && msgTo === userId)) {
        setMessages(prev => {
          // Prevent duplicates by _id or tempId
          if (msg._id && prev.some(m => m._id === msg._id || m._id === msg.tempId)) return prev;
          // Prevent duplicates by content+from+to+createdAt (rounded to 2s)
          const createdAt = msg.createdAt ? Math.round(new Date(msg.createdAt).getTime() / 2000) : 0;
          if (prev.some(m => m.content === msg.content && m.from === msg.from && m.to === msg.to && Math.round(new Date(m.createdAt).getTime() / 2000) === createdAt)) return prev;
          // If this is a real message for a temp one, replace it
          if (msg.tempId) {
            const tempIdx = prev.findIndex(m => m._id === msg.tempId);
            if (tempIdx !== -1) {
              const updated = [...prev];
              updated[tempIdx] = { ...msg };
              return updated;
            }
          }
          // Otherwise, add the new message
          return [...prev, msg];
        });
      }
    };
    socket.on('delivered', deliveredHandler);
    socket.on('read', readHandler);
    socket.on('receive-message', receiveMessageHandler);
    return () => {
      socket.off('delivered', deliveredHandler);
      socket.off('read', readHandler);
      socket.off('receive-message', receiveMessageHandler);
    };
  // Remove messages from dependency array to avoid stale closure issues
  }, [socket, friend._id, user]);

  // Emit read receipt when chat is open and there are unread messages
  useEffect(() => {
    if (!socket || !user) return;
    const unread = messages.some(m => m.from === friend._id && !readIds.includes(m._id!));
    if (unread) {
      socket.emit('read-messages', { from: friend._id, to: user.id });
    }
  }, [messages, friend._id, user, socket, readIds]);

  // Helper to generate a temp ID
  const generateTempId = () => 'temp-' + Math.random().toString(36).substr(2, 9);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const tempId = generateTempId();
    // Send real-time message
    sendMessage(friend._id, input, tempId); // pass tempId
    // Optimistically update UI
    setMessages(prev => [...prev, { from: user!.id, to: friend._id, content: input, status: 'sent', _id: tempId }]);
    setInput('');
    // Persist message in DB
    const apiUrl = import.meta.env.DEV ? 'http://localhost:5000/api/message/send' : '/api/message/send';
    await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('kidolio-token')}`
      },
      body: JSON.stringify({ from: user!.id, to: friend._id, content: input })
    });
    // Do NOT call fetchMessages here!
  };

  // Handler for emoji picker (scaffold)
  const handleEmojiClick = (emoji: string) => {
    setInput(input + emoji);
    setShowEmoji(false);
  };

  // Typing event emission (debounced, smooth)
  useEffect(() => {
    if (!user) return;
    if (!sendTyping) return;
    if (!friend?._id) return;
    if (isTyping !== lastTypingState.current) {
      sendTyping(friend._id, isTyping);
      lastTypingState.current = isTyping;
    }
  }, [isTyping, friend._id, user, sendTyping]);

  // Show typing indicator if friend is typing (only for receiver, never for sender, never for yourself)
  const { typingUsers } = useSocket();
  // Only show typing if: 1) friend is typing, 2) you are NOT the one typing, 3) the current chat is open, 4) friend is not you
  const isFriendTyping =
    friend._id !== user?.id && // friend is not you
    typingUsers.includes(friend._id) && // friend is typing
    !isTyping && // you are not typing
    user?.id !== friend._id; // extra guard

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!isTyping) setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1200); // 1.2s after last keypress
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
      sendTyping(friend._id, false); // On unmount, always send not typing
    };
    // eslint-disable-next-line
  }, [friend._id]);

  // Message status icon
  const getStatusIcon = (msg: Message) => {
    if (msg.from !== user?.id) return null;
    if (readIds.includes(msg._id!)) {
      // Double blue tick
      return (
        <span title="Read" style={{ marginLeft: 4 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: 'inline', verticalAlign: 'middle' }}>
            <polyline points="2,10 7,15 16,4" fill="none" stroke="#2196f3" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="6,10 11,15 18,4" fill="none" stroke="#2196f3" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      );
    } else if (deliveredIds.includes(msg._id!)) {
      // Double gray tick
      return (
        <span title="Delivered" style={{ marginLeft: 4 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: 'inline', verticalAlign: 'middle' }}>
            <polyline points="2,10 7,15 16,4" fill="none" stroke="#888" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="6,10 11,15 18,4" fill="none" stroke="#888" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      );
    } else {
      // Single gray tick
      return (
        <span title="Sent" style={{ marginLeft: 4 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: 'inline', verticalAlign: 'middle' }}>
            <polyline points="2,10 7,15 16,4" fill="none" stroke="#888" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      );
    }
  };

  // Export chat as .txt
  const handleExportChat = () => {
    const lines = messages.map(m => {
      const sender = m.from === user?.id ? 'You' : friend.name;
      const time = m.createdAt ? new Date(m.createdAt).toLocaleString() : '';
      return `[${time}] ${sender}: ${m.content}`;
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${friend.name || 'chat'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full min-h-0 bg-white dark:bg-gray-900 rounded-none shadow-none border-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-blue-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10 relative">
        <div className="relative">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow border-2 bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 text-blue-700 dark:text-white',
            onlineUsers?.includes(friend._id) ? 'border-green-400' : 'border-gray-300 dark:border-gray-700'
          )}>
            {friend.name?.trim() ? friend.name[0].toUpperCase() : '?'}
          </div>
          <span className={cn(
            'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900',
            onlineUsers?.includes(friend._id) ? 'bg-green-500' : 'bg-gray-400'
          )}></span>
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-bold truncate text-blue-900 dark:text-white cursor-pointer hover:underline"
            title="View Profile"
            onClick={() => onOpenProfile ? onOpenProfile(friend) : null}
            tabIndex={0}
            role="button"
            style={{ outline: 'none' }}
          >
            {friend.name?.trim() || 'No Name'}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {friend.role}
            {onlineUsers?.includes(friend._id) && <span className="text-green-600 ml-1">● online</span>}
            {/* Only show typing in header if friend is typing and NOT you */}
            {isFriendTyping && (
              <span className="text-blue-500 ml-2 animate-pulse">typing...</span>
            )}
          </div>
        </div>
        {/* Three-dot menu */}
        <div className="relative">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title="More options" onClick={() => setShowMenu(m => !m)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50">
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={async (e) => {
                e.preventDefault();
                setShowMenu(false);
                await fetch(`/api/message/chat/${friend._id}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('kidolio-token')}` }
                });
                setMessages([]);
                // Refetch messages to ensure UI is up to date
                fetchMessages();
              }}>Remove Chat</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={async (e) => {
                e.preventDefault();
                setShowMenu(false);
                await fetch(`/api/message/block/${friend._id}`, {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('kidolio-token')}` }
                });
                alert('User blocked.');
                // Refetch messages to ensure UI is up to date
                fetchMessages();
              }}>Block User</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => {
                setShowMenu(false);
                handleExportChat();
              }}>Export Chat</button>
            </div>
          )}
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
        <div className={cn('flex flex-col flex-1 overflow-y-auto gap-2 p-2', messages.length === 0 && 'justify-center')}
          style={{ minHeight: 200 }}>
          {messages.length === 0 && <div className="text-center text-gray-400">No messages yet.</div>}
          
          {messages.map((msg, i) => (
            <div key={i} className={cn('flex', msg.from === user?.id ? 'justify-end' : 'justify-start')}>
              <div className={cn('rounded-xl px-4 py-2 max-w-xs md:max-w-md shadow',
                msg.from === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-blue-900 dark:text-white',
                'relative flex items-center')}
              >
                <span>{msg.content}</span>
                {getStatusIcon(msg)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {/* Input bar with emoji picker button */}
      <form onSubmit={handleSend} className="relative flex items-center gap-2 p-4 border-t border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <button type="button" className="text-2xl px-2" onClick={() => setShowEmoji(v => !v)} title="Add emoji">
          😊
        </button>
        {showEmoji && (
          <div className="absolute bottom-16 left-4 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2">
            <div className="flex flex-wrap gap-1 max-w-xs">
              {["😀","😂","😍","😎","😭","👍","🙏","🎉","❤️","🔥"].map(e => (
                <button key={e} type="button" className="text-2xl p-1 hover:bg-gray-100 rounded" onClick={() => handleEmojiClick(e)}>{e}</button>
              ))}
            </div>
          </div>
        )}
        <input
          id="chat-input"
          className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 dark:bg-gray-800 text-blue-900 dark:text-white"
          placeholder="Type a message..."
          value={input}
          onChange={handleInputChange}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition">Send</button>
      </form>
    </div>
  );
};

export default ChatWindow;
