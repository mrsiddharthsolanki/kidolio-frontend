import React, { useEffect, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Card, CardContent } from '@/components/ui/card'; 
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Users, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfile {
  _id: string;
  name: string;
  role: string;
  fatherName?: string;
  isActive?: boolean;
  hasLogin?: boolean;
  parent?: string;
  dob?: string;
  gender?: string;
  photo?: string;
  // add more fields as needed
}

interface FriendRequest {
  _id: string;
  from: UserProfile;
  to: UserProfile;
  status: string;
}

const ROLES = [
  { key: 'parent', label: 'Parents', icon: <Users className="text-blue-500" /> },
  { key: 'child', label: 'Children', icon: <User className="text-pink-500" /> },
  { key: 'official', label: 'Officers', icon: <Shield className="text-green-500" /> },
];

const roleBadge = (role: string) => {
  switch (role) {
    case 'parent':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">Parent</Badge>;
    case 'child':
      return <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-pink-200">Child</Badge>;
    case 'official':
      return <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">Officer</Badge>;
    default:
      return <Badge variant="secondary">User</Badge>;
  }
};

interface UserListProps {
  onProfileClick?: (user: UserProfile) => void;
}

const UserList: React.FC<UserListProps> = ({ onProfileClick }) => {
  const { onlineUsers } = useSocket();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [friendStatus, setFriendStatus] = useState<{ [userId: string]: 'none' | 'accept' | 'requested' | 'friends' }>({});
  const [requestIds, setRequestIds] = useState<{ [userId: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('parent');

  useEffect(() => {
    api.get('/user/all')
      .then(res => {
        // setUsers(Array.isArray(res.data) ? res.data : []);
        setUsers(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const status: { [userId: string]: 'none' | 'accept' | 'requested' | 'friends' } = {};
    const reqIds: { [userId: string]: string } = {};
    api.get('/friend/friends')
      .then(res => {
        const friends: UserProfile[] = res.data;
        friends.forEach((f) => { status[f._id] = 'friends'; });
      })
      .finally(() => {
        api.get('/friend/requests')
          .then(res => {
            const requests: FriendRequest[] = res.data;
            requests.forEach((r) => {
              status[r.from._id] = 'accept';
              reqIds[r.from._id] = r._id;
            });
          })
          .finally(() => {
            api.get('/friend/requests?sent=1')
              .then(res => {
                const sent: FriendRequest[] = res.data;
                sent.forEach((r) => {
                  status[r.to._id] = 'requested';
                  reqIds[r.to._id] = r._id;
                });
              })
              .finally(() => {
                setFriendStatus(status);
                setRequestIds(reqIds);
                setLoading(false);
              });
          });
      });
  }, [user]);

  const sendRequest = (to: string) => {
    setLoading(true);
    api.post('/friend/send', { to })
      .then(() => {
        setFriendStatus(prev => ({ ...prev, [to]: 'requested' }));
        setLoading(false);
      });
  };

  const acceptRequest = (from: string) => {
    const requestId = requestIds[from];
    if (!requestId) return;
    setLoading(true);
    api.post('/friend/accept', { requestId })
      .then(() => {
        setFriendStatus(prev => ({ ...prev, [from]: 'friends' }));
        setLoading(false);
      });
  };

  // Group users by role (exclude current user by _id only, handle string/number types)
  const currentUserId = user?._id?.toString();
  const usersByRole = ROLES.reduce((acc, role) => {
    acc[role.key] = users.filter(u => u.role === role.key && u._id?.toString() !== currentUserId);
    return acc;
  }, {} as Record<string, UserProfile[]>);

  // Only show activated children in the Children tab
  const filteredUsersByRole = { ...usersByRole };
  filteredUsersByRole.child = (usersByRole.child || []).filter(u => u.isActive);

  // Helper: highlight active children (example: if user has isActive field, else fallback to online)
  const isActiveChild = (u: UserProfile) => u.role === 'child' && onlineUsers.includes(u._id);

  // Sort users: online first, then offline
  const sortOnlineFirst = (arr: UserProfile[]) => {
    return [
      ...arr.filter(u => onlineUsers.includes(u._id)),
      ...arr.filter(u => !onlineUsers.includes(u._id)),
    ];
  };

  // Render current user profile at the top
  const renderCurrentUser = () => {
    if (!user) return null;
    // Type assertion to UserProfile
    const currentUser = user as unknown as UserProfile;
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-2 md:p-3 rounded-xl bg-blue-100/80 dark:bg-blue-900/80 shadow border border-blue-200 dark:border-blue-800 mb-2',
          'ring-2 ring-blue-400 scale-[1.03]'
        )}
        onClick={() => onProfileClick?.(currentUser)}
      >
        <div className="relative">
          {((currentUser.role === 'child' || currentUser.role === 'official') && currentUser.photo) ? (
            <img
              src={currentUser.photo}
              alt={currentUser.name}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 shadow bg-white dark:bg-gray-800"
            />
          ) : (
            <div className={cn(
              'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl font-bold shadow border-2 bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 text-blue-700 dark:text-white',
              onlineUsers.includes(currentUser._id) ? 'border-green-400' : 'border-gray-300 dark:border-gray-700'
            )}>
              {currentUser.role === 'parent' && currentUser.fatherName ? currentUser.fatherName[0].toUpperCase() : (currentUser.name?.trim() ? currentUser.name[0].toUpperCase() : '?')}
            </div>
          )}
          <span className={cn(
            'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900',
            onlineUsers.includes(currentUser._id) ? 'bg-green-500' : 'bg-gray-400'
          )}></span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base truncate w-full text-blue-900 dark:text-white">
            {currentUser.role === 'parent' && currentUser.fatherName ? currentUser.fatherName : (currentUser.name?.trim() || 'No Name')} <span className="text-xs text-blue-500 font-semibold">(You)</span>
          </div>
          <div className="flex gap-2 items-center mt-0.5">{roleBadge(currentUser.role)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-blue-50/80 to-purple-50/80 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl p-2 md:p-4 border border-blue-100 dark:border-gray-800 w-full h-full flex flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900 scrollbar-thumb-rounded-full">
      {renderCurrentUser()}
      <div className="flex flex-col gap-2 mb-2">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-blue-900 dark:text-white px-4 pt-2 pb-1">All Users</h2>
        <div className="flex gap-1 md:gap-2 px-2">
          {ROLES.map(r => (
            <button
              key={r.key}
              className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold text-sm md:text-base transition-all duration-200 shadow-sm border-2 ${activeTab === r.key ? 'bg-blue-600 text-white border-blue-700 scale-105' : 'bg-white dark:bg-gray-800 text-blue-700 dark:text-gray-200 border-blue-200 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 hover:scale-105'}`}
              onClick={() => setActiveTab(r.key)}
            >
              {r.icon} {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto px-1 pb-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900 scrollbar-thumb-rounded-full">
        {filteredUsersByRole[activeTab]?.length === 0 && (
          <div className="text-center text-gray-400 text-base py-6">No users found in this category.</div>
        )}
        {sortOnlineFirst(filteredUsersByRole[activeTab] || []).map(u => (
          <div
            key={u._id}
            className={cn(
              'flex items-center gap-3 p-2 md:p-3 rounded-xl bg-white/80 dark:bg-gray-900/80 shadow border border-blue-100 dark:border-gray-800 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 transition-all',
              isActiveChild(u) && 'ring-2 ring-green-400 scale-[1.03]'
            )}
            onClick={() => onProfileClick?.(u)}
          >
            <div className="relative">
              {/* Show profile photo for child and officer if available, else show initial */}
              {((u.role === 'child' || u.role === 'official') && u.photo) ? (
                <img
                  src={u.photo}
                  alt={u.name}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 shadow bg-white dark:bg-gray-800"
                />
              ) : (
                <div className={cn(
                  'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl font-bold shadow border-2 bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 text-blue-700 dark:text-white',
                  onlineUsers.includes(u._id) ? 'border-green-400' : 'border-gray-300 dark:border-gray-700',
                  isActiveChild(u) && 'ring-2 ring-green-400'
                )}>
                  {/* For parent, show first letter of fatherName if present, else name */}
                  {u.role === 'parent' && u.fatherName ? u.fatherName[0].toUpperCase() : (u.name?.trim() ? u.name[0].toUpperCase() : '?')}
                </div>
              )}
              <span className={cn(
                'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900',
                onlineUsers.includes(u._id) ? 'bg-green-500' : 'bg-gray-400',
                isActiveChild(u) && 'ring-2 ring-green-400'
              )}></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-base truncate w-full text-blue-900 dark:text-white">
                {u.role === 'parent' && u.fatherName ? u.fatherName : (u.name?.trim() || (u.role === 'child' ? 'Child' : 'Unknown'))}
              </div>
              <div className="flex gap-2 items-center mt-0.5">{roleBadge(u.role)}</div>
              {isActiveChild(u) && <span className="text-xs text-green-600 font-semibold">Active Now</span>}
            </div>
            <div className="flex flex-col gap-1 items-end">
              {friendStatus[u._id] === 'friends' && <Badge className="bg-green-100 text-green-700 border-green-200">Friend</Badge>}
              {friendStatus[u._id] === 'requested' && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Requested</Badge>}
              {friendStatus[u._id] === 'accept' && (
                <Button
                  variant="default"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-0.5 rounded-full shadow text-xs"
                  onClick={e => { e.stopPropagation(); acceptRequest(u._id); }}
                  disabled={loading}
                >
                  Accept
                </Button>
              )}
              {!friendStatus[u._id] && (
                <Button
                  variant="default"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 py-0.5 rounded-full shadow text-xs"
                  onClick={e => { e.stopPropagation(); sendRequest(u._id); }}
                  disabled={loading}
                >
                  Add
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* DEBUG: Render the API response for troubleshooting
          Remove this after debugging */}
      {/* Debug panel removed after confirming children are present */}
    </div>
  );
};

export default UserList;
