import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { UserCircle, Edit, LogOut } from 'lucide-react';

interface MediaProfile {
  _id: string;
  userId: string;
  followers: Array<{ _id: string; name: string; role: string; photo?: string }>;
  following: Array<{ _id: string; name: string; role: string; photo?: string }>;
  postCount: number;
}

const PersonalProfilePanel: React.FC = () => {
  const { user, logout } = useAuth();
  const [media, setMedia] = useState<MediaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null); // To store extended user profile

  useEffect(() => {
    if (user && (user.id || user._id)) {
      setLoading(true);
      // Fetch media profile
      api.get(`/media/${user.id || user._id}`)
        .then(res => setMedia(res.data))
        .catch(() => setMedia(null));
      // Fetch user profile for parent-specific info (like fatherName)
      api.get(`/users/${user.id || user._id}`)
        .then(res => setProfile(res.data))
        .catch(() => setProfile(null))
        .finally(() => setLoading(false));
    } else {
      setMedia(null);
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  if (!user) return <div className="text-center text-gray-400 mt-10">Not logged in.</div>;
  if (loading) return <div className="text-center text-gray-400 mt-10">Loading profile...</div>;
  if (!media) return <div className="text-center text-gray-400 mt-10">Profile not found.</div>;

  // Safely extract fatherName for parent users
  const isParent = user.role === 'parent';
  const fatherName = isParent ? (profile?.fatherName || '') : '';
  const displayName = isParent
    ? (typeof fatherName === 'string' && fatherName.trim().length > 0 ? fatherName : (typeof user.name === 'string' && user.name.trim().length > 0 ? user.name : 'No Name'))
    : (typeof user.name === 'string' && user.name.trim().length > 0 ? user.name : 'No Name');
  const avatarInitial = isParent
    ? (typeof fatherName === 'string' && fatherName.trim().length > 0 ? fatherName[0].toUpperCase() : (typeof user.name === 'string' && user.name.trim().length > 0 ? user.name[0].toUpperCase() : '?'))
    : (typeof user.name === 'string' && user.name.trim().length > 0 ? user.name[0].toUpperCase() : '?');

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-lg p-4 md:p-8 mx-auto animate-fade-in">
      <div className="flex flex-col items-center gap-2 w-full relative">
        <div className="absolute top-0 right-0 mt-2 mr-2">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title="Settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 9 3.09V3a2 2 0 0 1 4 0v.09c0 .66.39 1.26 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09c0 .66.39 1.26 1 1.51h.09a2 2 0 0 1 0 4h-.09c-.66 0-1.26.39-1.51 1z"/></svg>
          </button>
        </div>
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-4xl md:text-5xl font-bold text-white shadow-lg border-4 border-white dark:border-gray-900">
          {avatarInitial}
        </div>
        <div className="text-2xl md:text-3xl font-extrabold text-blue-900 dark:text-white mt-2">
          {displayName}
        </div>
        {isParent && typeof fatherName === 'string' && fatherName.trim().length > 0 && (
          <div className="text-base text-gray-500 capitalize mb-1">Father Name: {fatherName}</div>
        )}
        {!isParent && (
          <div className="text-base text-gray-500 capitalize mb-1">{user.role || ''}</div>
        )}
      </div>
      <div className="flex gap-8 w-full justify-center mt-2">
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">{media?.postCount ?? 0}</span>
          <span className="text-xs text-gray-500">Posts</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">{media?.followers.length ?? 0}</span>
          <span className="text-xs text-gray-500">Followers</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg">{media?.following.length ?? 0}</span>
          <span className="text-xs text-gray-500">Following</span>
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"><Edit size={18}/> Edit Profile</button>
        <button className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold flex items-center gap-2" onClick={logout}><LogOut size={18}/> Logout</button>
      </div>
      <div className="w-full mt-8">
        <h3 className="text-lg font-bold mb-2 text-blue-900 dark:text-white">Followers</h3>
        <div className="flex flex-wrap gap-2">
          {media?.followers.map(f => (
            <div key={f._id} className="flex items-center gap-2 bg-blue-50 dark:bg-gray-800 rounded-lg px-3 py-1 text-sm">
              <UserCircle className="w-5 h-5 text-blue-400" /> {f.name}
            </div>
          ))}
          {media?.followers.length === 0 && <span className="text-gray-400">No followers yet.</span>}
        </div>
      </div>
      <div className="w-full mt-4">
        <h3 className="text-lg font-bold mb-2 text-blue-900 dark:text-white">Following</h3>
        <div className="flex flex-wrap gap-2">
          {media?.following.map(f => (
            <div key={f._id} className="flex items-center gap-2 bg-purple-50 dark:bg-gray-800 rounded-lg px-3 py-1 text-sm">
              <UserCircle className="w-5 h-5 text-purple-400" /> {f.name}
            </div>
          ))}
          {media?.following.length === 0 && <span className="text-gray-400">Not following anyone.</span>}
        </div>
      </div>
      {/* TODO: Add grid of posts here */}
    </div>
  );
};

export default PersonalProfilePanel;
