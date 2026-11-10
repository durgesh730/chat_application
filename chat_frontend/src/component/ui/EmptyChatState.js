import React from 'react';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import { useAuth } from '../../context/AuthContext';

const EmptyChatState = () => {
  const { user } = useAuth();

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-50 to-indigo-50/30 text-center select-none">
      <div className="max-w-md w-full">
        {/* Animated Brand Icon */}
        <div className="relative inline-flex mb-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-300/40 text-white transform -rotate-3 hover:rotate-0 transition-transform">
            <ChatBubbleOutlineIcon sx={{ fontSize: 40 }} />
          </div>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            ✓
          </span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name || 'Friend'}!
        </h2>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Select a person from the contacts list on the left to start a real-time 1-on-1 conversation.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-3.5 bg-white rounded-2xl shadow-xs border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <BoltOutlinedIcon sx={{ fontSize: 18 }} />
            </div>
            <h3 className="text-xs font-semibold text-gray-800">Instant Real-time</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Live typing, delivery ticks & instant replies</p>
          </div>

          <div className="p-3.5 bg-white rounded-2xl shadow-xs border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <PhotoLibraryOutlinedIcon sx={{ fontSize: 18 }} />
            </div>
            <h3 className="text-xs font-semibold text-gray-800">Media Sharing</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Share photos, emojis & react to messages</p>
          </div>

          <div className="p-3.5 bg-white rounded-2xl shadow-xs border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center mb-2">
              <SecurityOutlinedIcon sx={{ fontSize: 18 }} />
            </div>
            <h3 className="text-xs font-semibold text-gray-800">Private & Secure</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Direct 1-on-1 private messaging room</p>
          </div>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Pick a contact to begin your conversation
        </p>
      </div>
    </div>
  );
};

export default EmptyChatState;
