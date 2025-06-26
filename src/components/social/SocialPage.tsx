import React, { useState, useEffect, useRef } from 'react';
import UserList from './UserList';
import FriendsList from './FriendsList';
import ChatWindow from './ChatWindow';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { Users, MessageCircle, User, UserPlus, UserCircle } from 'lucide-react';
import PersonalProfilePanel from './PersonalProfilePanel';

interface FriendProfile {
  _id: string;
  name: string;
  role: string;
}

interface Post {
  _id: string;
  author: FriendProfile;
  content: string;
  likes: string[];
  comments: { user: FriendProfile; text: string; createdAt: string }[];
  createdAt: string;
}

interface ParentProfile {
  fatherName?: string;
  motherName?: string;
  email?: string;
  phone?: string;
  address?: string;
  [key: string]: unknown;
}

interface FullProfile {
  _id: string;
  name: string;
  role: string;
  fatherName?: string;
  motherName?: string;
  officialType?: string;
  gender?: string;
  dob?: string;
  photo?: string;
  email?: string;
  phone?: string;
  address?: string;
  parent?: ParentProfile;
}

interface FriendRequest {
  _id: string;
  from: FullProfile;
  to: FullProfile;
  status: string;
}

const TABS = [
  { key: 'feed', label: 'Feed', icon: <Users /> },
  { key: 'chats', label: 'Chats', icon: <MessageCircle /> },
  { key: 'friends', label: 'Friends', icon: <User /> },
  { key: 'requests', label: 'Requests', icon: <UserPlus /> },
];

const SocialPage: React.FC = () => {
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'chats' | 'friends' | 'requests'>('feed');
  const [selectedProfile, setSelectedProfile] = useState<FullProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);
  const [profilePosts, setProfilePosts] = useState<Post[]>([]);
  const [newPostCount, setNewPostCount] = useState(0);
  const lastFeedCheck = useRef<Date | null>(null);
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [profileDetails, setProfileDetails] = useState<FullProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [friendsRefreshKey, setFriendsRefreshKey] = useState(0);

  // Fetch feed posts (with polling for real-time updates)
  useEffect(() => {
    // Do not fetch posts, just show coming soon
    setPosts([]);
    setFeedLoading(false);
    setNewPostCount(0);
    // No API calls
  }, [activeTab]);

  // Fetch posts for selected profile
  useEffect(() => {
    // Do not fetch posts for profile, just show coming soon
    setProfilePosts([]);
    // No API calls
  }, [selectedProfile]);

  // Post creation
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    // Do nothing, post feature is coming soon
    // No API call
  };

  // Like post
  const handleLike = (postId: string) => {
    api.post(`/api/post/${postId}/like`).then(res => {
      setPosts(prev => prev.map(p => p._id === postId ? res.data : p));
      setProfilePosts(prev => prev.map(p => p._id === postId ? res.data : p));
    });
  };

  // Comment post (simple prompt for demo)
  const handleComment = async (postId: string) => {
    const text = prompt('Enter your comment:');
    if (!text) return;
    await api.post(`/api/post/${postId}/comment`, { text });
    // Refresh posts
    api.get('/api/post').then(res => setPosts(res.data));
    if (selectedProfile) api.get(`/api/post/user/${selectedProfile._id}`).then(res => setProfilePosts(res.data));
  };

  // Friend request logic
  const [friendStatus, setFriendStatus] = useState<'none' | 'requested' | 'accept' | 'friends'>('none');
  useEffect(() => {
    if (!selectedProfile || !user) return;
    api.get(`/friend/status/${selectedProfile._id}`).then(res => setFriendStatus(res.data.status));
  }, [selectedProfile, user]);

  const sendFriendRequest = () => {
    if (!selectedProfile) return;
    api.post('/friend/send', { to: selectedProfile._id }).then(() => setFriendStatus('requested'));
  };
  const acceptFriendRequest = () => {
    if (!selectedProfile) return;
    api.post('/friend/accept', { requestId: selectedProfile._id }).then(() => setFriendStatus('friends'));
  };

  // Start chat logic (set selectedFriend)
  const startChat = () => {
    if (!selectedProfile) return;
    setActiveTab('chats');
    setSelectedFriend(selectedProfile);
  };

  // Fetch full user details when profile is selected
  useEffect(() => {
    if (selectedProfile && selectedProfile._id && selectedProfile.role) {
      setProfileLoading(true);
      const fetchProfile = async () => {
        let details: FullProfile | null = null;
        try {
          if (selectedProfile.role === 'child') {
            const res = await api.get(`/child/${selectedProfile._id}`);
            details = res.data.child || res.data;
            details._id = details._id || selectedProfile._id;
            details.name = details.name || selectedProfile.name || '';
            details.role = 'child';
            details.photo = details.photo || '';
            details.gender = details.gender || '';
            if (details.dob) {
              if (typeof details.dob === 'string') {
                // ok
              } else if (details.dob && typeof details.dob === 'object' && 'toISOString' in details.dob) {
                details.dob = (details.dob as Date).toISOString().slice(0, 10);
              } else {
                details.dob = '';
              }
            } else {
              details.dob = '';
            }
            details.fatherName = details.fatherName || getParentField(details.parent, 'fatherName');
            details.motherName = details.motherName || getParentField(details.parent, 'motherName');
            details.email = details.email || getParentField(details.parent, 'email');
            details.phone = details.phone || getParentField(details.parent, 'phone');
            details.address = details.address || getParentField(details.parent, 'address');
          } else {
            const res = await api.get(`/user/${selectedProfile._id}`);
            details = res.data;
          }
        } catch (e) {
          details = null;
        }
        setProfileDetails(details);
        setProfileLoading(false);
      };
      fetchProfile();
      api.get(`/api/post/user/${selectedProfile._id}`).then(res => setProfilePosts(res.data));
    } else {
      setProfileDetails(null);
      setProfilePosts([]);
    }
  }, [selectedProfile]);

  // Profile Panel
  const ProfilePanel = ({ user }: { user: FriendProfile }) => (
    <div className="flex flex-1 min-h-0 min-w-0 w-full h-full items-center justify-center bg-gradient-to-br from-blue-100/60 to-purple-100/60 dark:from-gray-900 dark:to-gray-800 p-0 m-0 rounded-2xl shadow-xl animate-fade-in overflow-y-auto">
      {profileLoading ? (
        <div className="text-center text-gray-400 mt-10">Loading profile...</div>
      ) : profileDetails ? (
        <div className="w-full max-w-2xl flex flex-col items-center gap-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-lg p-4 md:p-8">
          {/* Avatar and Name */}
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-4xl md:text-5xl font-bold text-white shadow-lg border-4 border-white dark:border-gray-900">
              {profileDetails.name?.[0] || profileDetails.fatherName?.[0] || '?'}
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-blue-900 dark:text-white mt-2">
              {profileDetails.name?.trim()
                ? profileDetails.name
                : profileDetails.role === 'parent' && profileDetails.fatherName
                  ? profileDetails.fatherName
                  : 'Unknown User'}
            </div>
            <div className="text-base text-gray-500 capitalize mb-1">{profileDetails.role}</div>
          </div>

          {/* Info Sections */}
          <div className="w-full flex flex-col md:flex-row gap-4 md:gap-8 justify-center">
            {/* Basic Info */}
            <div className="flex-1 bg-blue-50/60 dark:bg-gray-800/60 rounded-xl p-4 flex flex-col gap-2 shadow">
              <div className="font-semibold text-blue-700 dark:text-blue-200 mb-1">Basic Info</div>
              {profileDetails.role === 'parent' && (
                <>
                  <div><span className="font-semibold">Mother Name:</span> <span className="opacity-70">{profileDetails.motherName || 'N/A'}</span></div>
                  <div><span className="font-semibold">Father Name:</span> <span className="opacity-70">{profileDetails.fatherName || 'N/A'}</span></div>
                </>
              )}
              {profileDetails.role === 'official' && profileDetails.officialType && (
                <div><span className="font-semibold">Officer Type:</span> {profileDetails.officialType}</div>
              )}
              {profileDetails.gender && (
                <div><span className="font-semibold">Gender:</span> <span className="opacity-70">{profileDetails.gender}</span></div>
              )}
              {profileDetails.dob && (
                <div><span className="font-semibold">Date of Birth:</span> <span className="opacity-70">{profileDetails.dob}</span></div>
              )}
            </div>
            {/* Contact Info */}
            <div className="flex-1 bg-purple-50/60 dark:bg-gray-800/60 rounded-xl p-4 flex flex-col gap-2 shadow">
              <div className="font-semibold text-purple-700 dark:text-purple-200 mb-1">Contact Info</div>
              <div><span className="font-semibold">Email:</span> <span className="opacity-70">{profileDetails.email || 'N/A'}</span></div>
              {profileDetails.phone && (
                <div><span className="font-semibold">Phone:</span> <span className="opacity-70">{profileDetails.phone}</span></div>
              )}
              {profileDetails.address && (
                <div><span className="font-semibold">Address:</span> <span className="opacity-70">{profileDetails.address}</span></div>
              )}
              <div><span className="font-semibold">Status:</span> <span className={onlineUsers.includes(profileDetails._id) ? 'text-green-500' : 'text-gray-400'}>{onlineUsers.includes(profileDetails._id) ? 'Active' : 'Offline'}</span></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-2 w-full justify-center">
            <button className="bg-blue-500 text-white px-4 py-2 md:px-5 md:py-2 rounded-lg font-semibold shadow hover:bg-blue-600 transition" onClick={startChat}>Start Chat</button>
            {friendStatus === 'none' && <button className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 md:px-5 md:py-2 rounded-lg font-semibold shadow hover:bg-gray-300 dark:hover:bg-gray-700 transition" onClick={sendFriendRequest}>Send Friend Request</button>}
            {friendStatus === 'accept' && <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-green-600 transition" onClick={acceptFriendRequest}>Accept Request</button>}
            {friendStatus === 'requested' && <span className="text-yellow-600 font-semibold">Requested</span>}
            {friendStatus === 'friends' && <span className="text-green-600 font-semibold">Friend</span>}
          </div>

          {/* User's posts/feed here */}
          <div className="mt-8 w-full">
            <h3 className="text-lg font-bold mb-2 text-blue-900 dark:text-white">Posts</h3>
            <div className="space-y-4">
              {profilePosts.length === 0 && <div className="text-gray-400">No posts yet.</div>}
              {profilePosts.map(post => (
                <div key={post._id} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-blue-100 dark:border-gray-700 shadow-sm">
                  <div className="text-gray-900 dark:text-white mb-2">{post.content}</div>
                  <div className="flex gap-4 text-sm">
                    <button className="text-blue-500 hover:underline" onClick={() => handleLike(post._id)}>
                      Like ({post.likes.length})
                    </button>
                    <button className="text-blue-500 hover:underline" onClick={() => handleComment(post._id)}>
                      Comment ({post.comments.length})
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {post.likes.map(uid => (
                      <span key={uid} className="text-xs text-blue-700 cursor-pointer underline" onClick={() => setSelectedProfile({ _id: uid, name: 'User', role: 'user' })}>@{uid}</span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    {post.comments.map((c, i) => (
                      <div key={i} className="text-xs text-gray-600 dark:text-gray-300">
                        <span className="font-semibold cursor-pointer underline" onClick={() => setSelectedProfile(c.user)}>{c.user.name}</span>: {c.text}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : <div className="text-center text-gray-400 mt-10">No profile data.</div>}
    </div>
  );

  // Feed with post creation
  const Feed = () => (
    <div className="flex flex-col h-full w-full">
      <div className="p-4 md:p-6 border-b border-blue-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80">
        <form className="flex gap-2 md:gap-3" onSubmit={handleCreatePost}>
          <input
            className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 md:px-4 md:py-2 bg-gray-50 dark:bg-gray-800 text-blue-900 dark:text-white"
            placeholder="What's on your mind?"
            value={postContent}
            onChange={e => setPostContent(e.target.value)}
            disabled
          />
          <button
            className="bg-blue-300 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold cursor-not-allowed"
            disabled
          >Post</button>
        </form>
        <div className="mt-2 text-xs text-blue-500 font-semibold">Post feature coming soon!</div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 md:p-6 space-y-4 md:space-y-6">
        {/* Always show coming soon if no posts */}
        {feedLoading && <div className="text-center text-gray-400">Loading feed...</div>}
        {posts.length === 0 && !feedLoading && <div className="text-center text-blue-500 font-semibold">Post feature coming soon!</div>}
        {posts.map(post => (
          <div key={post._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6 flex flex-col gap-2 md:gap-3 cursor-pointer" onClick={() => setSelectedProfile(post.author)}>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-lg md:text-xl font-bold text-white">{post.author.name?.[0] || '?'}</div>
              <div>
                <div className="font-semibold text-blue-900 dark:text-white">{post.author.name}</div>
                <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
              </div>
            </div>
            <div className="text-base md:text-lg text-gray-800 dark:text-gray-100">{post.content}</div>
            <div className="flex gap-3 md:gap-4 mt-1 md:mt-2">
              <button className="text-blue-500 hover:underline" disabled>Like ({post.likes.length})</button>
              <button className="text-blue-500 hover:underline" disabled>Comment ({post.comments.length})</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Requests Panel
  const RequestsPanel = () => {
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
      setLoading(true);
      api.get('/friend/requests').then(res => {
        setRequests(res.data || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }, []);

    const acceptRequest = (requestId: string) => {
      api.post('/friend/accept', { requestId }).then(() => {
        setRequests(prev => prev.filter(r => r._id !== requestId));
        setFriendsRefreshKey(k => k + 1); // trigger FriendsList refresh
      });
    };

    if (loading) return <div className="flex-1 flex items-center justify-center text-gray-400">Loading requests...</div>;
    if (!requests.length) return <div className="flex-1 flex items-center justify-center text-gray-400">No requests.</div>;

    return (
      <div className="flex flex-col gap-3 p-4">
        <h2 className="text-xl font-bold mb-2 text-blue-900 dark:text-white">Friend Requests</h2>
        {requests.map(r => (
          <div key={r._id} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg shadow p-3 border border-blue-100 dark:border-gray-700">
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-lg font-bold text-blue-900">{r.from?.name?.[0] || '?'}</div>
            <div className="flex-1">
              <div className="font-semibold text-blue-900 dark:text-white">{r.from?.name || 'Unknown'}</div>
              <div className="text-xs text-gray-500">{r.from?.role}</div>
            </div>
            <button className="bg-green-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-green-600" onClick={() => acceptRequest(r._id)}>Accept</button>
          </div>
        ))}
      </div>
    );
  };

  // WhatsApp-style layout, fully responsive
  // Mobile: show FriendsList full screen when "Chats" tab is active, then ChatWindow full screen when a friend is selected
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const showFriendsList = activeTab === 'chats' && (isMobile ? !selectedFriend : true);
  const showChatWindow = activeTab === 'chats' && selectedFriend;

  return (
    <div className="w-full h-[100dvh] flex flex-col md:flex-row bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar nav - fixed at bottom on mobile, left on desktop */}
      <div
        className="w-full md:w-[80px] flex flex-row md:flex-col bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-blue-100 dark:border-gray-800 items-center py-2 md:py-6 gap-2 md:gap-6 shadow-xl z-10
        fixed bottom-0 left-0 right-0 md:static md:bottom-auto md:left-auto md:right-auto
        md:h-full
        justify-between md:justify-start
        md:rounded-none rounded-t-2xl
        md:shadow-xl shadow-2xl
        md:border-t-0 border-t border-blue-100 dark:border-gray-800
        "
        style={{
          maxWidth: '100vw',
          minHeight: '56px',
          height: '56px',
          ...(window.innerWidth >= 768 ? {} : { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50 })
        }}
      >
        {/* My Profile button */}
        <button
          className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full mb-0 md:mb-2 text-lg md:text-xl font-bold transition bg-blue-400 text-white shadow`}
          onClick={() => {
            if (user) {
              setSelectedProfile(userToFullProfile(user));
              setActiveTab('feed');
              setSelectedFriend(null);
            }
          }}
          title="My Profile"
        >
          <UserCircle />
        </button>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full mb-0 md:mb-2 text-lg md:text-xl font-bold transition ${activeTab === tab.key ? 'bg-blue-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
            onClick={() => { setActiveTab(tab.key as typeof activeTab); setSelectedProfile(null); setSelectedFriend(null); }}
            title={tab.label}
          >
            {tab.icon}
            {tab.key === 'feed' && newPostCount > 0 && <span className="ml-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </button>
        ))}
      </div>
      {/* Spacer for mobile nav bar */}
      <div className="block md:hidden h-[56px] w-full" />
      {/* Middle section: feed or chat list */}
      <div className="flex-1 flex flex-col max-w-full md:max-w-md border-b md:border-b-0 md:border-r border-blue-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80">
        {/* Search bar removed */}
        {/* Show FriendsList or Feed/UserList/RequestsPanel as per tab and mobile/desktop logic */}
        {activeTab === 'feed' && <Feed />}
        {showFriendsList && (
          <div className="flex-1 overflow-y-auto p-1 md:p-2">
            <FriendsList key={friendsRefreshKey} onSelect={setSelectedFriend} onProfileClick={setSelectedProfile} />
          </div>
        )}
        {activeTab === 'friends' && (
          <div className="flex-1 overflow-y-auto p-1 md:p-2">
            <UserList onProfileClick={(u) => {
              const { parent, ...rest } = u;
              setSelectedProfile(userToFullProfile({ ...rest, parent: typeof parent === 'object' ? parent : undefined }));
            }} />
          </div>
        )}
        {activeTab === 'requests' && (
          <div className="flex-1 overflow-y-auto p-1 md:p-2">
            <RequestsPanel />
          </div>
        )}
      </div>
      {/* Right section: chat window, profile, or post details */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 min-h-[300px]">
        {showChatWindow && (
          <div
            className={isMobile ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col' : 'flex flex-col h-full'}
            style={isMobile ? { height: '100dvh' } : { minHeight: 0, minWidth: 0, height: '100%' }}
          >
            <ChatWindow
              friend={selectedFriend}
              onOpenProfile={setSelectedProfile}
              onBack={isMobile ? () => setSelectedFriend(null) : undefined}
            />
          </div>
        )}
        {activeTab === 'feed' && selectedProfile && (user && selectedProfile._id === (user.id || user._id)
          ? <PersonalProfilePanel />
          : <ProfilePanel user={selectedProfile} />)}
        {activeTab === 'friends' && selectedProfile && (user && selectedProfile._id === (user.id || user._id)
          ? <PersonalProfilePanel />
          : <ProfilePanel user={selectedProfile} />)}
        {((activeTab === 'chats' && !selectedFriend && !showFriendsList) || ((activeTab === 'feed' || activeTab === 'friends') && !selectedProfile)) && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xl md:text-2xl font-semibold">Select a chat, user, or post</div>
        )}
      </div>
    </div>
  );
};

export default SocialPage;

// Helper to safely extract parent fields
function getParentField(parent: ParentProfile | undefined, field: keyof ParentProfile): string {
  if (parent && typeof parent === 'object' && parent[field] && typeof parent[field] === 'string') {
    return parent[field] as string;
  }
  return '';
}

// Helper to convert User to FullProfile
function userToFullProfile(user: Partial<FullProfile> & { id?: string; profileImage?: string; parent?: unknown }): FullProfile {
  let parent: ParentProfile | undefined = undefined;
  if (user.parent && typeof user.parent === 'object') {
    parent = user.parent as ParentProfile;
  }
  // If parent is a string (from UserProfile), ignore it
  return {
    _id: user._id || user.id || '',
    name: user.name || '',
    role: user.role || '',
    fatherName: user.fatherName,
    motherName: user.motherName,
    officialType: user.officialType,
    gender: user.gender,
    dob: user.dob,
    photo: user.photo || user.profileImage,
    email: user.email,
    phone: user.phone,
    address: user.address,
    parent,
  };
}
