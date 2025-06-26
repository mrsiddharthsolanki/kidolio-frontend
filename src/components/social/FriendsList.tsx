import React, { useEffect, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { cn } from '@/lib/utils';

interface FriendProfile {
  _id: string;
  name: string;
  role: string;
  lastSeen?: string;
  fatherName?: string; // Add this to fix possible undefined error
}

interface FriendsListProps {
  onSelect: (friend: FriendProfile) => void;
  onProfileClick?: (friend: FriendProfile) => void;
}

const FriendsList: React.FC<FriendsListProps> = ({ onSelect, onProfileClick }) => {
  const { onlineUsers, typingUsers = [], lastSeenMap = {} } = useSocket();
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Listen for refresh trigger from parent (SocialPage)
  useEffect(() => {
    api.get('/friend/friends')
      .then(res => Array.isArray(res.data) ? setFriends(res.data) : setFriends([]))
      .catch(() => setFriends([]));
  }, [user, window.location.pathname, window.location.search]); // refresh on route and query change

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-center text-blue-900 dark:text-white">Your Friends</h2>
      <ul className="space-y-2">
        {friends.length === 0 && <li className="text-gray-400 text-center">No friends yet.</li>}
        {friends.map(f => {
          const isOnline = onlineUsers.includes(f._id);
          // Only show typing if: 1) friend is typing, 2) friend is not you, 3) you are not typing to them, 4) you are not currently typing, 5) you are viewing this chat
          const isTyping = typingUsers.includes(f._id) && f._id !== user?.id && selectedId === f._id && !typingUsers.includes(user?.id);
          const lastSeen = lastSeenMap[f._id];
          return (
            <li
              key={f._id}
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800',
                selectedId === f._id && 'bg-blue-100 dark:bg-gray-800 border border-blue-300 dark:border-blue-700'
              )}
              onClick={() => { setSelectedId(f._id); onSelect(f); }}
            >
              <div className="relative">
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold shadow border-2 bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 text-blue-700 dark:text-white',
                  isOnline ? 'border-green-400' : 'border-gray-300 dark:border-gray-700'
                )}>
                  {f.name?.trim() ? f.name[0].toUpperCase() : '?'}
                </div>
                <span className={cn(
                  'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900',
                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                )}></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate text-blue-900 dark:text-white">
                  {f.role === 'parent' && f.fatherName
                    ? f.fatherName
                    : (f.name?.trim() ? f.name : 'Unknown')}
                </div>
                {f.role === 'parent' && f.fatherName && (
                  <div className="text-xs text-gray-500">Father: {f.fatherName}</div>
                )}
                <div className="text-xs text-gray-500 capitalize flex items-center gap-2">
                  {f.role}
                  {isOnline && <span className="text-green-600 ml-1">● online</span>}
                  {!isOnline && lastSeen && (
                    <span className="ml-1" title={`Last seen: ${lastSeen}`}>last seen {new Date(lastSeen).toLocaleString()}</span>
                  )}
                </div>
              </div>
              {onProfileClick && (
                <button
                  className="ml-2 text-xs text-blue-500 hover:underline"
                  onClick={e => { e.stopPropagation(); onProfileClick(f); }}
                >
                  View
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FriendsList;
