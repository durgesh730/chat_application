import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Message from '../features/Message';
import EmojiPicker from '../component/custom/EmojiPicker';
import AiWritingAssistant from '../component/custom/AiWritingAssistant';
import AiReplySuggestions from '../component/custom/AiReplySuggestions';
import ProfileUI from '../component/ui/profileUI.js/ProfileUI';
import fetcher from '../helper/fetcher';
import { playSentMessageSound } from '../helper/sound';

// Material Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SendIcon from '@mui/icons-material/Send';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import QuickreplyOutlinedIcon from '@mui/icons-material/QuickreplyOutlined';

// MUI Components
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

const Chat = () => {
  const { user, receiver, setReceiver } = useAuth();
  const {
    socket,
    isUserOnline,
    updateRecentConversation,
    sendInvite,
    respondInvite,
    fetchConnectedUsers,
    fetchPendingInvites,
  } = useSocket();

  const senderId = user?._id;
  const receiverId = receiver?._id;

  // Instagram-style Handles and Unique IDs
  const receiverHandle = receiver?.username
    ? `@${receiver.username.replace(/^@/, '')}`
    : `@user_${receiver?._id ? String(receiver._id).slice(-6) : 'anonymous'}`;

  const receiverUniqueId =
    receiver?.uniqueId || (receiver?._id ? `u_${String(receiver._id).slice(-8)}` : '');

  // Connection & Chat Invite State
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking' | 'accepted' | 'pending_sent' | 'pending_received' | 'none'
  const [inviteData, setInviteData] = useState(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteNote, setInviteNote] = useState("Hey! Let's chat.");
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [showAiReplies, setShowAiReplies] = useState(false);
  const [openProfileDrawer, setOpenProfileDrawer] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  // Image Upload State
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // In-Chat Search State
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Dialogs
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [deleteDialogData, setDeleteDialogData] = useState(null);

  // Scroll & UI refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [newMessagesWhileScrolled, setNewMessagesWhileScrolled] = useState(0);

  const isReceiverOnline = isUserOnline(receiverId);

  // Scroll to bottom smoothly
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setNewMessagesWhileScrolled(0);
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isScrolledUp = distanceFromBottom > 200;
    setShowScrollBottom(isScrolledUp);
    if (!isScrolledUp) {
      setNewMessagesWhileScrolled(0);
    }
  };

  // 1. Check Chat Invite / Connection Status when contact changes
  useEffect(() => {
    if (!receiverId) return;
    setConnectionStatus('checking');
    setShowAiAssistant(false);
    setShowAiReplies(false);
    setShowEmojiPicker(false);

    fetcher
      .get(`/invite/status/${receiverId}`)
      .then((res) => {
        if (res.data?.success) {
          const status = res.data.data.status;
          setConnectionStatus(status);
          setInviteData(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Error checking invite status:', err);
        setConnectionStatus('none');
      });
  }, [receiverId]);

  // Listen for real-time invite acceptance
  useEffect(() => {
    if (!socket || !receiverId) return;

    const handleInviteAccepted = ({ invite, partner }) => {
      const partnerId = String(partner?._id || partner);
      if (partnerId === String(receiverId)) {
        setConnectionStatus('accepted');
        fetchConnectedUsers();
        socket.emit('joinRoom', receiverId, senderId);
        socket.emit('fetchMessages', { receiverId, senderId });
      }
    };

    socket.on('chatInviteAccepted', handleInviteAccepted);

    return () => {
      socket.off('chatInviteAccepted', handleInviteAccepted);
    };
  }, [socket, receiverId, senderId, fetchConnectedUsers]);

  // 2. Join room & fetch messages ONLY if invite is accepted
  useEffect(() => {
    if (!socket || !senderId || !receiverId || connectionStatus !== 'accepted') return;

    socket.emit('joinRoom', receiverId, senderId);
    socket.emit('fetchMessages', { receiverId, senderId });

    const handleAllMessages = (msgs) => {
      setMessages(
        msgs.map((msg) => ({
          ...msg,
          isSender: String(msg.senderId?._id || msg.senderId) === String(senderId),
          name:
            String(msg.senderId?._id || msg.senderId) === String(senderId)
              ? 'You'
              : receiverHandle,
          username:
            String(msg.senderId?._id || msg.senderId) === String(senderId)
              ? user?.username
              : receiver?.username,
          time: new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          avatar:
            String(msg.senderId?._id || msg.senderId) === String(senderId)
              ? user?.profile_image
              : receiver?.profile_image,
        }))
      );
      setTimeout(() => scrollToBottom('auto'), 80);
    };

    const handleMessageReceived = (newMsg) => {
      const isCurrentConversation =
        (String(newMsg.senderId?._id || newMsg.senderId) === String(receiverId) &&
          String(newMsg.receiverId?._id || newMsg.receiverId) === String(senderId)) ||
        (String(newMsg.senderId?._id || newMsg.senderId) === String(senderId) &&
          String(newMsg.receiverId?._id || newMsg.receiverId) === String(receiverId));

      if (isCurrentConversation) {
        const formattedMsg = {
          ...newMsg,
          isSender: String(newMsg.senderId?._id || newMsg.senderId) === String(senderId),
          name:
            String(newMsg.senderId?._id || newMsg.senderId) === String(senderId)
              ? 'You'
              : receiverHandle,
          username:
            String(newMsg.senderId?._id || newMsg.senderId) === String(senderId)
              ? user?.username
              : receiver?.username,
          time: new Date(newMsg.createdAt || newMsg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          avatar:
            String(newMsg.senderId?._id || newMsg.senderId) === String(senderId)
              ? user?.profile_image
              : receiver?.profile_image,
        };

        setMessages((prev) => [...prev, formattedMsg]);

        if (String(newMsg.senderId?._id || newMsg.senderId) === String(receiverId)) {
          socket.emit('markAsRead', {
            receiverId: senderId,
            senderId: receiverId,
          });
        }

        if (chatContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
          const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
          if (isAtBottom) {
            setTimeout(() => scrollToBottom('smooth'), 50);
          } else {
            setNewMessagesWhileScrolled((prev) => prev + 1);
          }
        }
      }
    };

    const handleMessagesRead = ({ readBy }) => {
      if (String(readBy) === String(receiverId)) {
        setMessages((prev) =>
          prev.map((msg) => (msg.isSender ? { ...msg, status: 'read' } : msg))
        );
      }
    };

    const handleMessageReacted = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, reactions } : msg))
      );
    };

    const handleMessageDeleted = ({ messageId, deleteForEveryone }) => {
      if (deleteForEveryone) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  deletedForEveryone: true,
                  message: 'This message was deleted',
                  fileUrl: null,
                }
              : msg
          )
        );
      } else {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      }
    };

    const handleChatCleared = () => {
      setMessages([]);
    };

    const handleTyping = ({ senderId: typingUser }) => {
      if (String(typingUser) === String(receiverId)) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ senderId: typingUser }) => {
      if (String(typingUser) === String(receiverId)) {
        setIsTyping(false);
      }
    };

    socket.on('allMessages', handleAllMessages);
    socket.on('messageReceived', handleMessageReceived);
    socket.on('messagesRead', handleMessagesRead);
    socket.on('messageReacted', handleMessageReacted);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('chatCleared', handleChatCleared);
    socket.on('typing', handleTyping);
    socket.on('stop typing', handleStopTyping);

    return () => {
      socket.off('allMessages', handleAllMessages);
      socket.off('messageReceived', handleMessageReceived);
      socket.off('messagesRead', handleMessagesRead);
      socket.off('messageReacted', handleMessageReacted);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('chatCleared', handleChatCleared);
      socket.off('typing', handleTyping);
      socket.off('stop typing', handleStopTyping);
    };
  }, [socket, receiverId, senderId, connectionStatus, receiverHandle, receiver?.username, receiver?.profile_image, user?.username, user?.profile_image]);

  // Handle typing input with debounce
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputMessage(val);

    if (!socket || !receiverId || !senderId || connectionStatus !== 'accepted') return;

    socket.emit('typing', receiverId, senderId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop typing', receiverId, senderId);
    }, 1500);
  };

  // Image selection
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP, GIF)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setSelectedImage({
        file,
        preview: URL.createObjectURL(file),
        base64: uploadEvent.target.result,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Send message handler
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();

    if (connectionStatus !== 'accepted') {
      alert('Chat invite must be accepted before messages can be sent.');
      return;
    }

    const trimmedText = inputMessage.trim();
    if (!trimmedText && !selectedImage) return;

    if (!socket || !senderId || !receiverId) return;

    socket.emit('stop typing', receiverId, senderId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    let messageType = 'text';
    let fileUrl = null;
    let fileName = null;

    if (selectedImage) {
      setIsUploading(true);
      try {
        const uploadRes = await fetcher.post('/message/upload', {
          fileData: selectedImage.base64,
        });
        if (uploadRes.data?.success) {
          fileUrl = uploadRes.data.data.url;
          fileName = selectedImage.file.name;
          messageType = 'image';
        }
      } catch (err) {
        console.error('Image upload fallback:', err);
        fileUrl = selectedImage.base64;
        fileName = selectedImage.file.name;
        messageType = 'image';
      } finally {
        setIsUploading(false);
      }
    }

    const payload = {
      senderId,
      receiverId,
      message: trimmedText,
      messageType,
      fileUrl,
      fileName,
      replyTo: replyingTo
        ? {
            messageId: replyingTo._id,
            message:
              replyingTo.message ||
              (replyingTo.messageType === 'image' ? 'Photo' : 'Attachment'),
            senderName: replyingTo.isSender ? 'You' : receiverHandle,
          }
        : null,
    };

    socket.emit('newMessage', payload);
    playSentMessageSound();

    updateRecentConversation(receiverId, {
      lastMessage: trimmedText || (messageType === 'image' ? '📷 Photo' : 'Attachment'),
      lastMessageTime: new Date().toISOString(),
      lastMessageType: messageType,
      lastSenderId: senderId,
    });

    setInputMessage('');
    setSelectedImage(null);
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowAiAssistant(false);
    setShowAiReplies(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Reactions
  const handleReact = (messageId, emoji) => {
    if (!socket || !senderId || connectionStatus !== 'accepted') return;
    socket.emit('reactMessage', {
      messageId,
      userId: senderId,
      emoji,
      receiverId,
    });
  };

  // Delete message
  const handleDeleteMessage = (msg) => {
    setDeleteDialogData({ message: msg });
  };

  const confirmDeleteMessage = (deleteForEveryone) => {
    if (!deleteDialogData?.message || !socket) return;
    const msgId = deleteDialogData.message._id;

    socket.emit('deleteMessage', {
      messageId: msgId,
      senderId,
      receiverId,
      deleteForEveryone,
    });

    setDeleteDialogData(null);
  };

  // Clear chat
  const handleConfirmClearChat = () => {
    if (!socket || !senderId || !receiverId) return;
    socket.emit('clearChat', { senderId, receiverId });
    setMessages([]);
    setShowClearDialog(false);
    setOpenProfileDrawer(false);
  };

  // Send Chat Invite action
  const handleSendInvite = async () => {
    setIsSendingInvite(true);
    try {
      await sendInvite(receiverId, inviteNote);
      setConnectionStatus('pending_sent');
      setInviteModalOpen(false);
    } catch (err) {
      alert(err.message || 'Error sending invite');
    } finally {
      setIsSendingInvite(false);
    }
  };

  // Respond to Chat Invite action (Accept / Decline)
  const handleRespondInvite = async (action) => {
    if (!inviteData?.inviteId) return;
    try {
      await respondInvite(inviteData.inviteId, action);
      if (action === 'accept') {
        setConnectionStatus('accepted');
        fetchConnectedUsers();
      } else {
        setReceiver(null);
      }
      fetchPendingInvites();
    } catch (err) {
      alert(err.message || 'Error responding to invite');
    }
  };

  // In-Chat Search Matches
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return messages
      .map((msg, index) => ({ msg, index }))
      .filter(({ msg }) =>
        (msg.message || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [messages, searchQuery]);

  // Group messages by Date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDate = '';

    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt || msg.timestamp);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let dateLabel = '';
      if (msgDate.toDateString() === today.toDateString()) {
        dateLabel = 'Today';
      } else if (msgDate.toDateString() === yesterday.toDateString()) {
        dateLabel = 'Yesterday';
      } else {
        dateLabel = msgDate.toLocaleDateString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
      }

      if (dateLabel !== lastDate) {
        groups.push({ type: 'date', label: dateLabel });
        lastDate = dateLabel;
      }
      groups.push({ type: 'message', data: msg });
    });

    return groups;
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative select-none">
      {/* 1. Header with Instagram Handle & Unique ID */}
      <header className="px-4 py-3 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between z-10 shadow-xs">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            type="button"
            onClick={() => setReceiver(null)}
            className="p-1.5 -ml-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-xl transition-colors md:hidden"
            title="Back to contacts"
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </button>

          <div
            className="relative cursor-pointer shrink-0"
            onClick={() => setOpenProfileDrawer(true)}
          >
            <img
              src={
                receiver?.profile_image ||
                `https://ui-avatars.com/api/?background=random&size=128&rounded=true&name=${encodeURIComponent(receiverHandle)}`
              }
              alt={receiverHandle}
              className="w-11 h-11 rounded-full object-cover shadow-xs ring-2 ring-indigo-50 hover:ring-indigo-300 transition-all"
            />
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                isReceiverOnline
                  ? 'bg-emerald-500 ring-2 ring-emerald-200'
                  : 'bg-gray-300'
              }`}
              title={isReceiverOnline ? 'Online' : 'Offline'}
            />
          </div>

          <div
            className="min-w-0 cursor-pointer"
            onClick={() => setOpenProfileDrawer(true)}
          >
            <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate hover:text-indigo-600 transition-colors">
              {receiverHandle}
            </h2>
            <div className="flex items-center space-x-1.5 h-4">
              {isTyping ? (
                <div className="flex items-center space-x-1 text-emerald-600 text-xs font-medium">
                  <span className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                  </span>
                  <span className="ml-1">typing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs ${
                      isReceiverOnline ? 'text-emerald-600 font-medium' : 'text-gray-400'
                    }`}
                  >
                    {isReceiverOnline ? 'Online' : 'Offline'}
                  </span>
                  <span className="text-[10px] font-mono text-gray-300">
                    {receiverUniqueId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Header Controls */}
        <div className="flex items-center space-x-1 text-gray-500">
          {connectionStatus === 'accepted' && (
            <>
              <Tooltip title="Search in chat" arrow>
                <button
                  type="button"
                  onClick={() => {
                    setShowSearch(!showSearch);
                    setSearchQuery('');
                  }}
                  className={`p-2 rounded-xl transition-colors ${
                    showSearch
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'hover:bg-gray-100 hover:text-indigo-600'
                  }`}
                >
                  <SearchIcon sx={{ fontSize: 20 }} />
                </button>
              </Tooltip>

              <Tooltip title="Clear chat history" arrow>
                <button
                  type="button"
                  onClick={() => setShowClearDialog(true)}
                  className="p-2 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                >
                  <DeleteSweepIcon sx={{ fontSize: 20 }} />
                </button>
              </Tooltip>
            </>
          )}

          <Tooltip title="View User Profile" arrow>
            <button
              type="button"
              onClick={() => setOpenProfileDrawer(true)}
              className="p-2 hover:bg-gray-100 hover:text-indigo-600 rounded-xl transition-colors"
            >
              <InfoOutlinedIcon sx={{ fontSize: 20 }} />
            </button>
          </Tooltip>
        </div>
      </header>

      {/* 2. In-Chat Search Bar */}
      {showSearch && connectionStatus === 'accepted' && (
        <div className="px-4 py-2 bg-indigo-50/90 border-b border-indigo-100 flex items-center justify-between text-xs z-10">
          <div className="flex items-center flex-1 max-w-md space-x-2">
            <SearchIcon sx={{ fontSize: 18 }} className="text-indigo-500" />
            <input
              type="text"
              placeholder="Search in this chat..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentMatchIndex(0);
              }}
              autoFocus
              className="w-full bg-white border border-indigo-200 rounded-lg py-1 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2 ml-3">
            {searchQuery && (
              <span className="text-indigo-700 font-medium">
                {searchMatches.length > 0
                  ? `${currentMatchIndex + 1} of ${searchMatches.length} matches`
                  : 'No matches'}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
              className="p-1 text-gray-500 hover:text-gray-800 rounded-lg"
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </button>
          </div>
        </div>
      )}

      {/* 3. Messages Stream OR Invite Wall */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        style={{
          backgroundImage:
            'radial-gradient(rgba(99, 102, 241, 0.04) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {connectionStatus === 'checking' ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
            <CircularProgress size={24} sx={{ color: '#6366f1' }} />
            <span className="text-xs">Checking connection...</span>
          </div>
        ) : connectionStatus === 'pending_sent' ? (
          /* INVITE PENDING STATE */
          <div className="flex flex-col items-center justify-center h-full text-center px-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mb-4 shadow-sm border border-amber-100">
              <HourglassEmptyIcon sx={{ fontSize: 32 }} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Chat Invite Sent
            </h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              You sent a chat invite to{' '}
              <strong className="text-gray-900">{receiverHandle}</strong> ({receiverUniqueId}).
              As soon as they accept your invite, this 1-on-1 chat room will automatically unlock!
            </p>
            <div className="p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 w-full flex items-center space-x-2">
              <LockOutlinedIcon sx={{ fontSize: 16 }} className="text-gray-400 shrink-0" />
              <span>Instagram-style privacy: messages are protected until accepted.</span>
            </div>
          </div>
        ) : connectionStatus === 'pending_received' ? (
          /* INVITE RECEIVED STATE */
          <div className="flex flex-col items-center justify-center h-full text-center px-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-4 shadow-sm border border-indigo-100">
              <WavingHandIcon sx={{ fontSize: 32 }} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {receiverHandle} wants to chat
            </h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              "{inviteData?.message || 'Sent you a chat invite'}"
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Accepting will allow {receiverHandle} to send messages and see when you are active.
            </p>
            <div className="flex space-x-3 w-full">
              <button
                type="button"
                onClick={() => handleRespondInvite('accept')}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-95 transition-opacity"
              >
                Accept Invite
              </button>
              <button
                type="button"
                onClick={() => handleRespondInvite('reject')}
                className="py-2.5 px-4 bg-gray-100 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        ) : connectionStatus === 'none' ? (
          /* NO CONNECTION STATE */
          <div className="flex flex-col items-center justify-center h-full text-center px-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 text-gray-500 rounded-3xl flex items-center justify-center mb-4 shadow-sm">
              <LockOutlinedIcon sx={{ fontSize: 32 }} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Start a 1-on-1 Chat
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              To message <strong className="text-gray-900">{receiverHandle}</strong> ({receiverUniqueId}),
              you must send a chat invite first. Once they accept, you can start messaging.
            </p>
            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className="py-2.5 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-95 transition-opacity flex items-center space-x-2"
            >
              <SendIcon sx={{ fontSize: 14 }} />
              <span>Send Chat Invite</span>
            </button>
          </div>
        ) : (
          /* ACCEPTED CHAT: MESSAGE STREAM */
          messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-16">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-md border border-gray-100 flex items-center justify-center text-indigo-500 mb-4 transform hover:scale-110 transition-transform">
                <WavingHandIcon sx={{ fontSize: 32 }} />
              </div>
              <h3 className="text-base font-bold text-gray-800">
                You are connected!
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Chat invite accepted. Say hello to {receiverHandle}!
              </p>
              <button
                type="button"
                onClick={() => {
                  setInputMessage('Hello! 👋');
                }}
                className="mt-4 px-4 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors"
              >
                Say "Hello! 👋"
              </button>
            </div>
          ) : (
            groupedMessages.map((item, idx) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${idx}`} className="flex justify-center my-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-xs border border-gray-200/80 rounded-full text-[11px] font-medium text-gray-500 shadow-2xs">
                      {item.label}
                    </span>
                  </div>
                );
              }

              const msg = item.data;
              return (
                <Message
                  key={msg._id || idx}
                  msg={msg}
                  isSender={msg.isSender}
                  currentUserId={senderId}
                  onReply={(m) => setReplyingTo(m)}
                  onReact={handleReact}
                  onDelete={handleDeleteMessage}
                  onImageClick={(url) => setLightboxImage(url)}
                />
              );
            })
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && connectionStatus === 'accepted' && (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-24 right-6 z-20 w-10 h-10 bg-white hover:bg-gray-50 text-indigo-600 rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all hover:scale-105"
          title="Scroll to bottom"
        >
          <KeyboardArrowDownIcon />
          {newMessagesWhileScrolled > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {newMessagesWhileScrolled}
            </span>
          )}
        </button>
      )}

      {/* Replying Banner */}
      {replyingTo && connectionStatus === 'accepted' && (
        <div className="px-4 py-2 bg-indigo-50/90 border-t border-indigo-100 flex items-center justify-between text-xs z-10">
          <div className="flex items-center space-x-2 border-l-4 border-indigo-600 pl-2 min-w-0">
            <div>
              <span className="font-semibold text-indigo-700 block">
                Replying to {replyingTo.isSender ? 'yourself' : receiverHandle}
              </span>
              <p className="text-gray-600 truncate max-w-sm">
                {replyingTo.message ||
                  (replyingTo.messageType === 'image' ? '📷 Photo' : 'Attachment')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-indigo-100"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      )}

      {/* Image Preview Banner */}
      {selectedImage && connectionStatus === 'accepted' && (
        <div className="px-4 py-2 bg-white border-t border-gray-200 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <img
              src={selectedImage.preview}
              alt="Preview"
              className="w-14 h-14 object-cover rounded-xl border border-gray-200 shadow-xs"
            />
            <div className="text-xs">
              <span className="font-medium text-gray-800 block truncate max-w-[200px]">
                {selectedImage.file?.name}
              </span>
              <span className="text-gray-400">
                {(selectedImage.file?.size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
            title="Remove attachment"
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      )}

      {/* 4. Bottom Input Bar OR Bottom Request Acceptance Bar */}
      {connectionStatus === 'accepted' ? (
        <footer className="p-3 bg-white border-t border-gray-100 z-10 relative">
          {showEmojiPicker && (
            <EmojiPicker
              onSelectEmoji={(emoji) => {
                setInputMessage((prev) => prev + emoji);
              }}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}

          {/* AI Writing Assistant Popup */}
          {showAiAssistant && (
            <AiWritingAssistant
              currentMessage={inputMessage}
              onApply={(newMessage) => setInputMessage(newMessage)}
              onClose={() => setShowAiAssistant(false)}
            />
          )}

          {/* AI Reply Suggestions Popup */}
          {showAiReplies && (
            <AiReplySuggestions
              receiverId={receiverId}
              partnerHandle={receiverHandle}
              onSelectReply={(replyText) => setInputMessage(replyText)}
              onClose={() => setShowAiReplies(false)}
            />
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />

          <form
            onSubmit={handleSendMessage}
            className="flex items-center bg-gray-100/90 hover:bg-gray-150 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 border border-gray-200/80 rounded-2xl p-1.5 transition-all duration-200"
          >
            <Tooltip title="Add Emoji" arrow>
              <button
                type="button"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowAiAssistant(false);
                  setShowAiReplies(false);
                }}
                className={`p-2 rounded-xl transition-colors ${
                  showEmojiPicker
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/60'
                }`}
              >
                <SentimentSatisfiedAltIcon sx={{ fontSize: 22 }} />
              </button>
            </Tooltip>

            <Tooltip title="Attach photo" arrow>
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowAiAssistant(false);
                  setShowAiReplies(false);
                  setShowEmojiPicker(false);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors"
              >
                <AttachFileIcon sx={{ fontSize: 22 }} />
              </button>
            </Tooltip>

            <input
              type="text"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-800 placeholder-gray-400 border-0 focus:outline-none focus:ring-0"
              placeholder={
                selectedImage
                  ? 'Add an optional caption...'
                  : `Message ${receiverHandle}...`
              }
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />

            {/* AI Writing Assistant Button */}
            <Tooltip title="AI Writing Assistant (Grammar & Rewrite)" arrow>
              <button
                type="button"
                onClick={() => {
                  setShowAiAssistant((prev) => !prev);
                  setShowAiReplies(false);
                  setShowEmojiPicker(false);
                }}
                className={`p-2 rounded-xl transition-all ${
                  showAiAssistant
                    ? 'text-indigo-600 bg-indigo-100 ring-1 ring-indigo-400'
                    : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50/70'
                }`}
              >
                <AutoAwesomeIcon sx={{ fontSize: 20 }} />
              </button>
            </Tooltip>

            {/* AI Reply Suggestions Button */}
            <Tooltip title="AI Reply Suggestions (Gemini Context)" arrow>
              <button
                type="button"
                onClick={() => {
                  setShowAiReplies((prev) => !prev);
                  setShowAiAssistant(false);
                  setShowEmojiPicker(false);
                }}
                className={`p-2 rounded-xl transition-all ${
                  showAiReplies
                    ? 'text-violet-600 bg-violet-100 ring-1 ring-violet-400'
                    : 'text-gray-400 hover:text-violet-600 hover:bg-violet-50/70'
                }`}
              >
                <QuickreplyOutlinedIcon sx={{ fontSize: 20 }} />
              </button>
            </Tooltip>

            <button
              type="submit"
              disabled={(!inputMessage.trim() && !selectedImage) || isUploading}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                (inputMessage.trim() || selectedImage) && !isUploading
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-300/40 hover:scale-105 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isUploading ? (
                <CircularProgress size={18} sx={{ color: 'white' }} />
              ) : (
                <SendIcon sx={{ fontSize: 18 }} />
              )}
            </button>
          </form>
        </footer>
      ) : connectionStatus === 'pending_received' ? (
        <footer className="p-3 bg-white border-t border-gray-100 flex items-center justify-between z-10">
          <span className="text-xs text-gray-600">
            Accept invite from <strong>{receiverHandle}</strong> to start chatting.
          </span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleRespondInvite('accept')}
              className="py-1.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 transition-opacity"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => handleRespondInvite('reject')}
              className="py-1.5 px-3 bg-gray-100 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
            >
              Decline
            </button>
          </div>
        </footer>
      ) : null}

      {/* 5. Profile Drawer */}
      <Drawer
        PaperProps={{
          sx: { width: { xs: '85%', sm: '380px' } },
        }}
        anchor="right"
        open={openProfileDrawer}
        onClose={() => setOpenProfileDrawer(false)}
      >
        <ProfileUI
          profile={receiver}
          onClearChat={() => setShowClearDialog(true)}
          isCurrentAuthUser={false}
        />
      </Drawer>

      {/* 6. Lightbox Fullscreen Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <CloseIcon sx={{ fontSize: 24 }} />
          </button>
          <img
            src={lightboxImage}
            alt="Fullscreen view"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* 7. Clear Chat Dialog */}
      <Dialog
        open={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        <DialogTitle className="font-bold text-gray-900">
          Clear Conversation History?
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-600">
            This will clear messages in this chat with {receiverHandle}. This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions className="px-4 pb-3">
          <MuiButton
            onClick={() => setShowClearDialog(false)}
            sx={{ textTransform: 'none', color: '#6b7280' }}
          >
            Cancel
          </MuiButton>
          <MuiButton
            onClick={handleConfirmClearChat}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Clear Chat
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* 8. Delete Message Dialog */}
      <Dialog
        open={Boolean(deleteDialogData)}
        onClose={() => setDeleteDialogData(null)}
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        <DialogTitle className="font-bold text-gray-900">
          Delete Message?
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-600">
            Do you want to delete this message?
          </p>
        </DialogContent>
        <DialogActions className="px-4 pb-3 flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <MuiButton
            onClick={() => setDeleteDialogData(null)}
            sx={{ textTransform: 'none', color: '#6b7280' }}
          >
            Cancel
          </MuiButton>
          <MuiButton
            onClick={() => confirmDeleteMessage(false)}
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Delete for Me
          </MuiButton>
          {deleteDialogData?.message?.isSender && (
            <MuiButton
              onClick={() => confirmDeleteMessage(true)}
              variant="contained"
              color="error"
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Delete for Everyone
            </MuiButton>
          )}
        </DialogActions>
      </Dialog>

      {/* 9. Send Chat Invite Modal */}
      <Dialog
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3, p: 1, maxWidth: 420 },
        }}
      >
        <DialogTitle className="font-bold text-gray-900 pb-1">
          Send Chat Invite
        </DialogTitle>
        <DialogContent>
          <p className="text-xs text-gray-500 mb-3">
            In Instagram-style messaging, you can chat once{' '}
            <strong className="text-gray-900">{receiverHandle}</strong> accepts your invite.
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
            onClick={() => setInviteModalOpen(false)}
            sx={{ textTransform: 'none', color: '#6b7280' }}
          >
            Cancel
          </MuiButton>
          <MuiButton
            onClick={handleSendInvite}
            variant="contained"
            disabled={isSendingInvite}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
            }}
          >
            {isSendingInvite ? <CircularProgress size={16} sx={{ color: 'white' }} /> : 'Send Invite'}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Chat;
