import React, { useState, useMemo, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import SearchInput from '../../custom/SearchInput';
import { useGetAllUser } from '../../../hooks/auth/auth';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

import {
  Drawer,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  CircularProgress,
} from '@mui/material';
import ProfileUI from '../profileUI.js/ProfileUI';
import { getSoundEnabled, setSoundEnabled } from '../../../helper/sound';

const drawerWidth = 360;

export default function SideDrawer({ onSelectContact }) {
  const { state, isLoading } = useGetAllUser();
  const { setReceiver, receiver, user, logout } = useAuth();
  const {
    isUserOnline,
    unreadCounts,
    resetUnreadForUser,
    recentConversations,
    pendingInvites,
    connectedUserIds,
    sendInvite,
    respondInvite,
    fetchPendingInvites,
    fetchConnectedUsers,
  } = useSocket();

  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'requests' | 'discover'
  const [search, setSearch] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [soundOn, setSoundOn] = useState(getSoundEnabled());

  // Invite modal dialog
  const [inviteModalUser, setInviteModalUser] = useState(null);
  const [inviteNote, setInviteNote] = useState('Hey! Let\'s chat.');
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    fetchPendingInvites();
    fetchConnectedUsers();
  }, [fetchPendingInvites, fetchConnectedUsers]);

  const handleToggleSound = () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    setSoundEnabled(nextState);
  };

  const handleSelectUser = (contact) => {
    setReceiver(contact);
    resetUnreadForUser(contact._id);
    if (onSelectContact) {
      onSelectContact(contact);
    }
  };

  const handleSendInviteSubmit = async () => {
    if (!inviteModalUser) return;
    setSendingInvite(true);
    try {
      await sendInvite(inviteModalUser._id, inviteNote);
      setInviteModalUser(null);
      setInviteNote('Hey! Let\'s chat.');
      fetchPendingInvites();
      fetchConnectedUsers();
    } catch (err) {
      alert(err.message || 'Failed to send invite');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleAcceptInvite = async (inviteId, partner) => {
    try {
      await respondInvite(inviteId, 'accept');
      fetchConnectedUsers();
      fetchPendingInvites();
      if (partner) {
        setReceiver(partner);
      }
    } catch (err) {
      alert(err.message || 'Error accepting invite');
    }
  };

  const handleRejectInvite = async (inviteId) => {
    try {
      await respondInvite(inviteId, 'reject');
      fetchPendingInvites();
    } catch (err) {
      alert(err.message || 'Error declining invite');
    }
  };

  // 1. Accepted Chats list
  const acceptedChatUsers = useMemo(() => {
    if (!state?.data) return [];
    return state.data
      .filter((item) => connectedUserIds.has(String(item._id)))
      .filter((item) => {
        const query = search.toLowerCase().replace(/^@/, '');
        if (!query) return true;
        const username = (item.username || '').toLowerCase();
        const uniqueId = (item.uniqueId || '').toLowerCase();
        return username.includes(query) || uniqueId.includes(query);
      })
      .sort((a, b) => {
        const timeA = recentConversations[a._id]?.lastMessageTime
          ? new Date(recentConversations[a._id].lastMessageTime).getTime()
          : 0;
        const timeB = recentConversations[b._id]?.lastMessageTime
          ? new Date(recentConversations[b._id].lastMessageTime).getTime()
          : 0;
        return timeB - timeA;
      });
  }, [state?.data, connectedUserIds, search, recentConversations]);

  // 2. Discover Users list (users not yet connected)
  const discoverUsers = useMemo(() => {
    if (!state?.data) return [];
    const query = search.toLowerCase().replace(/^@/, '');
    return state.data.filter((item) => {
      if (query) {
        const username = (item.username || '').toLowerCase();
        const uniqueId = (item.uniqueId || '').toLowerCase();
        return username.includes(query) || uniqueId.includes(query);
      }
      return true;
    });
  }, [state?.data, search]);

  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const userHandle = user?.username
    ? `@${user.username.replace(/^@/, '')}`
    : `@user_${user?._id ? String(user._id).slice(-6) : 'me'}`;

  const userUniqueId = user?.uniqueId || (user?._id ? `u_${String(user._id).slice(-8)}` : '');

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-100 select-none" style={{ width: drawerWidth }}>
      {/* Current User Header (Instagram Style) */}
      <div className="p-4 border-b border-gray-100 bg-white/90 backdrop-blur-md flex items-center justify-between">
        <div
          onClick={() => setOpenDrawer(true)}
          className="flex items-center space-x-3 cursor-pointer group min-w-0"
        >
          <div className="relative shrink-0">
            <img
              src={
                user?.profile_image ||
                `https://ui-avatars.com/api/?background=random&size=128&rounded=true&name=${encodeURIComponent(userHandle)}`
              }
              alt={userHandle}
              className="w-10 h-10 rounded-full object-cover shadow-xs ring-2 ring-indigo-50 group-hover:ring-indigo-300 transition-all"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
              {userHandle}
            </h1>
            <span className="text-[11px] font-mono text-gray-400 block truncate">
              {userUniqueId}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1 text-gray-500">
          <Tooltip title={soundOn ? 'Sound Notifications On' : 'Sound Notifications Muted'} arrow>
            <button
              type="button"
              onClick={handleToggleSound}
              className={`p-2 rounded-xl transition-colors ${
                soundOn ? 'hover:bg-indigo-50 hover:text-indigo-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              {soundOn ? <VolumeUpIcon sx={{ fontSize: 20 }} /> : <VolumeOffIcon sx={{ fontSize: 20 }} />}
            </button>
          </Tooltip>

          <Tooltip title="View My ID & Profile" arrow>
            <button
              type="button"
              onClick={() => setOpenDrawer(true)}
              className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
            >
              <PersonOutlineIcon sx={{ fontSize: 20 }} />
            </button>
          </Tooltip>

          <Tooltip title="Logout" arrow>
            <button
              type="button"
              onClick={logout}
              className="p-2 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
            >
              <LogoutIcon sx={{ fontSize: 20 }} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Modern Navigation Tabs (Chats | Requests | Discover) */}
      <div className="flex p-2 bg-gray-50/80 border-b border-gray-100 gap-1 text-xs font-semibold">
        {/* Chats Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'chats'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
          <span>Chats</span>
          {acceptedChatUsers.length > 0 && (
            <span className="text-[10px] text-gray-400">({acceptedChatUsers.length})</span>
          )}
        </button>

        {/* Requests Tab (Instagram DM Style) */}
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all relative ${
            activeTab === 'requests'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <MarkEmailUnreadOutlinedIcon sx={{ fontSize: 16 }} />
          <span>Requests</span>
          {pendingInvites.length > 0 && (
            <span className="px-1.5 py-0.2 bg-indigo-600 text-white rounded-full text-[10px] font-bold">
              {pendingInvites.length}
            </span>
          )}
        </button>

        {/* Discover / New Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'discover'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <PersonSearchOutlinedIcon sx={{ fontSize: 16 }} />
          <span>Discover</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 pb-2">
        <SearchInput
          search={search}
          onchange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder={
            activeTab === 'discover'
              ? 'Search unique ID or @username...'
              : 'Search @username or ID...'
          }
        />
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-2 text-gray-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading...</span>
          </div>
        ) : activeTab === 'chats' ? (
          /* TAB 1: ACCEPTED CHATS */
          acceptedChatUsers.length === 0 ? (
            <div className="text-center py-12 px-4 text-gray-400">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ChatBubbleOutlineIcon sx={{ fontSize: 24 }} />
              </div>
              <p className="text-sm font-semibold text-gray-700">No active chats yet</p>
              <p className="text-xs mt-1 text-gray-400 max-w-xs mx-auto">
                Users can only chat after an invite is sent and accepted.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('discover')}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                Discover Users & Send Invite
              </button>
            </div>
          ) : (
            <List className="space-y-1">
              {acceptedChatUsers.map((item) => {
                const isSelected = receiver?._id === item._id;
                const online = isUserOnline(item._id);
                const unread = unreadCounts[item._id] || 0;
                const recent = recentConversations[item._id];
                const handle = item.username ? `@${item.username.replace(/^@/, '')}` : `@user_${item._id.slice(-6)}`;
                const uid = item.uniqueId || `u_${item._id.slice(-8)}`;

                return (
                  <ListItem key={item._id} disablePadding className="rounded-xl overflow-hidden">
                    <ListItemButton
                      onClick={() => handleSelectUser(item)}
                      className={`py-3 px-3 rounded-xl transition-all duration-150 flex items-center space-x-3 ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200/50'
                          : 'hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={
                            item?.profile_image ||
                            `https://ui-avatars.com/api/?background=random&size=128&rounded=true&name=${encodeURIComponent(handle)}`
                          }
                          alt={handle}
                          className="w-12 h-12 rounded-full object-cover shadow-xs"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${
                            isSelected ? 'border-indigo-600' : 'border-white'
                          } ${
                            online
                              ? 'bg-emerald-500 ring-2 ring-emerald-200'
                              : 'bg-gray-300'
                          }`}
                          title={online ? 'Online' : 'Offline'}
                        />
                      </div>

                      {/* User Info (Strictly Username & Unique ID) */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span
                            className={`text-sm font-bold truncate ${
                              isSelected ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {handle}
                          </span>
                          {recent?.lastMessageTime && (
                            <span
                              className={`text-[10px] shrink-0 ml-1 ${
                                isSelected ? 'text-indigo-200' : 'text-gray-400'
                              }`}
                            >
                              {formatMessageTime(recent.lastMessageTime)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p
                            className={`text-xs truncate max-w-[170px] ${
                              isSelected
                                ? 'text-indigo-100'
                                : unread > 0
                                ? 'font-medium text-gray-900'
                                : 'text-gray-400'
                            }`}
                          >
                            {recent?.lastMessage || (online ? 'Active now' : uid)}
                          </p>

                          {unread > 0 && (
                            <span
                              className={`ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                                isSelected
                                  ? 'bg-white text-indigo-700'
                                  : 'bg-indigo-600 text-white'
                              }`}
                            >
                              {unread > 99 ? '99+' : unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )
        ) : activeTab === 'requests' ? (
          /* TAB 2: INCOMING CHAT INVITES (Instagram Request Style) */
          pendingInvites.length === 0 ? (
            <div className="text-center py-12 px-4 text-gray-400">
              <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MarkEmailUnreadOutlinedIcon sx={{ fontSize: 24 }} />
              </div>
              <p className="text-sm font-semibold text-gray-700">No message requests</p>
              <p className="text-xs mt-1 text-gray-400">
                When someone wants to start a 1-on-1 chat with you, their invite will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2 mt-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2">
                Pending Invites ({pendingInvites.length})
              </span>
              {pendingInvites.map((invite) => {
                const sender = invite.senderId;
                const handle = sender?.username
                  ? `@${sender.username.replace(/^@/, '')}`
                  : `@user_${sender?._id ? String(sender._id).slice(-6) : 'anonymous'}`;
                const uid = sender?.uniqueId || (sender?._id ? `u_${String(sender._id).slice(-8)}` : '');

                return (
                  <div
                    key={invite._id}
                    className="p-3 bg-white border border-gray-100 rounded-2xl shadow-xs space-y-2 hover:border-indigo-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          sender?.profile_image ||
                          `https://ui-avatars.com/api/?background=random&size=128&rounded=true&name=${encodeURIComponent(handle)}`
                        }
                        alt={handle}
                        className="w-11 h-11 rounded-full object-cover shadow-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-bold text-gray-900 block truncate">
                          {handle}
                        </span>
                        <span className="text-[11px] font-mono text-gray-400 block truncate">
                          {uid}
                        </span>
                      </div>
                    </div>

                    {/* Invite Message Note */}
                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-xl italic">
                      "{invite.message || 'Wants to start a chat with you'}"
                    </p>

                    {/* Accept / Decline Action Buttons */}
                    <div className="flex space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleAcceptInvite(invite._id, sender)}
                        className="flex-1 py-1.5 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:opacity-95 flex items-center justify-center space-x-1 transition-opacity"
                      >
                        <CheckIcon sx={{ fontSize: 16 }} />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectInvite(invite._id)}
                        className="py-1.5 px-3 bg-gray-100 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* TAB 3: DISCOVER & SEND INVITES */
          <div className="space-y-2 mt-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2">
              Find Users ({discoverUsers.length})
            </span>
            {discoverUsers.length === 0 ? (
              <div className="text-center py-10 px-4 text-gray-400 text-xs">
                No users found matching "{search}"
              </div>
            ) : (
              discoverUsers.map((item) => {
                const isConnected = connectedUserIds.has(String(item._id));
                const online = isUserOnline(item._id);
                const handle = item.username ? `@${item.username.replace(/^@/, '')}` : `@user_${item._id.slice(-6)}`;
                const uid = item.uniqueId || `u_${item._id.slice(-8)}`;

                return (
                  <div
                    key={item._id}
                    className="p-3 bg-white border border-gray-100 rounded-2xl shadow-xs flex items-center justify-between space-x-3 hover:border-indigo-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={
                            item?.profile_image ||
                            `https://ui-avatars.com/api/?background=random&size=128&rounded=true&name=${encodeURIComponent(handle)}`
                          }
                          alt={handle}
                          className="w-11 h-11 rounded-full object-cover shadow-xs"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            online ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-gray-900 block truncate">
                          {handle}
                        </span>
                        <span className="text-[11px] font-mono text-gray-400 block truncate">
                          {uid}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    {isConnected ? (
                      <button
                        type="button"
                        onClick={() => {
                          setReceiver(item);
                          setActiveTab('chats');
                        }}
                        className="py-1.5 px-3 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors shrink-0"
                      >
                        Chat
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setInviteModalUser(item)}
                        className="py-1.5 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:opacity-95 transition-opacity shrink-0 flex items-center space-x-1"
                      >
                        <SendIcon sx={{ fontSize: 13 }} />
                        <span>Invite</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* User Profile Drawer */}
      <Drawer
        PaperProps={{
          sx: { width: { xs: '85%', sm: '380px' } },
        }}
        anchor="left"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        <ProfileUI profile={user} isCurrentAuthUser={true} />
      </Drawer>

      {/* Send Chat Invite Modal */}
      <Dialog
        open={Boolean(inviteModalUser)}
        onClose={() => setInviteModalUser(null)}
        PaperProps={{
          sx: { borderRadius: 3, p: 1, maxWidth: 420 },
        }}
      >
        <DialogTitle className="font-bold text-gray-900 pb-1">
          Send Chat Invite
        </DialogTitle>
        <DialogContent>
          <p className="text-xs text-gray-500 mb-3">
            In Instagram-style messaging, you can only chat once{' '}
            <strong className="text-gray-900">
              {inviteModalUser?.username
                ? `@${inviteModalUser.username.replace(/^@/, '')}`
                : 'this user'}
            </strong>{' '}
            accepts your chat invite.
          </p>
          <div className="mb-2">
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Introduction note (optional)
            </label>
            <textarea
              rows={3}
              value={inviteNote}
              onChange={(e) => setInviteNote(e.target.value)}
              placeholder="Write a friendly note..."
              className="w-full text-sm border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </DialogContent>
        <DialogActions className="px-4 pb-3">
          <MuiButton
            onClick={() => setInviteModalUser(null)}
            sx={{ textTransform: 'none', color: '#6b7280' }}
          >
            Cancel
          </MuiButton>
          <MuiButton
            onClick={handleSendInviteSubmit}
            variant="contained"
            disabled={sendingInvite}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
            }}
          >
            {sendingInvite ? <CircularProgress size={16} sx={{ color: 'white' }} /> : 'Send Invite'}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}
