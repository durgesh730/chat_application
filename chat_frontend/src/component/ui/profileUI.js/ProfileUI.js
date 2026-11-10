import React from 'react';
import TagIcon from '@mui/icons-material/Tag';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useSocket } from '../../../context/SocketContext';

const ProfileUI = ({ profile, onClearChat, isCurrentAuthUser = false }) => {
  const { isUserOnline } = useSocket();
  const online = profile?._id ? isUserOnline(profile._id) : false;

  if (!profile) return null;

  const displayHandle = profile.username
    ? `@${profile.username.replace(/^@/, '')}`
    : `@user_${profile._id ? String(profile._id).slice(-6) : 'anonymous'}`;

  const displayUniqueId = profile.uniqueId || (profile._id ? `u_${String(profile._id).slice(-8)}` : 'ID-Unknown');

  return (
    <div className="w-full h-full bg-white flex flex-col p-6 overflow-y-auto">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center pt-4 pb-6 border-b border-gray-100">
        <div className="relative mb-4">
          <img
            className="w-28 h-28 object-cover rounded-full shadow-lg ring-4 ring-indigo-50"
            src={
              profile.profile_image ||
              `https://ui-avatars.com/api/?background=random&size=128&rounded=true&name=${encodeURIComponent(displayHandle)}`
            }
            alt={displayHandle}
          />
          <span
            className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${
              online ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-gray-400'
            }`}
            title={online ? 'Online' : 'Offline'}
          />
        </div>

        <h2 className="text-xl font-bold text-gray-900">{displayHandle}</h2>
        <span className="text-xs font-mono text-gray-400 mt-0.5">
          {displayUniqueId}
        </span>

        <div className="flex items-center space-x-1.5 mt-2 text-xs">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              online ? 'bg-emerald-500' : 'bg-gray-400'
            }`}
          />
          <span className={online ? 'text-emerald-600 font-medium' : 'text-gray-500'}>
            {online ? 'Active now' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Profile Details (strictly private info protected) */}
      <div className="py-6 space-y-3.5 flex-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
          User Identifier
        </h3>

        {/* Instagram Handle */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TagIcon sx={{ fontSize: 18 }} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-gray-400 block">Username</span>
            <span className="text-sm font-semibold text-gray-900 truncate block">
              {displayHandle}
            </span>
          </div>
        </div>

        {/* Unique ID */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FingerprintIcon sx={{ fontSize: 18 }} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-gray-400 block">Unique User ID</span>
            <span className="text-sm font-mono font-medium text-gray-800 truncate block">
              {displayUniqueId}
            </span>
          </div>
        </div>

        {/* Privacy protected note for other users */}
        {!isCurrentAuthUser ? (
          <div className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-gray-500">
            <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center">
              <LockOutlinedIcon sx={{ fontSize: 18 }} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-400 block">Privacy Protected</span>
              <span className="text-xs text-gray-600">
                Email and personal details are strictly private
              </span>
            </div>
          </div>
        ) : (
          /* Email visible ONLY to the account owner */
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <EmailOutlinedIcon sx={{ fontSize: 18 }} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-400 block">My Email (Private to me)</span>
              <span className="text-sm font-medium text-gray-800 truncate block">
                {profile.email || 'Not provided'}
              </span>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircleIcon sx={{ fontSize: 18 }} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-gray-400 block">Connection Status</span>
            <span className="text-sm font-medium text-gray-800 truncate block">
              {isCurrentAuthUser ? 'Active Account' : 'Accepted Chat Connection'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {!isCurrentAuthUser && onClearChat && (
        <div className="pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClearChat}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            <span>Clear Conversation History</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileUI;
