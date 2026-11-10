import React, { useState } from 'react';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ReplyIcon from '@mui/icons-material/Reply';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Tooltip } from '@mui/material';
import { QUICK_REACTIONS } from '../component/custom/EmojiPicker';

const Message = ({
  msg,
  isSender,
  onReply,
  onReact,
  onDelete,
  onImageClick,
  currentUserId,
}) => {
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const {
    _id,
    message,
    messageType,
    fileUrl,
    replyTo,
    reactions = [],
    status = 'sent',
    time,
    avatar,
    username,
    name,
    deletedForEveryone,
  } = msg;

  const displayHandle = username ? `@${username.replace(/^@/, '')}` : (name || 'User');

  const handleCopy = () => {
    if (message) {
      navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Group reactions by emoji: { '❤️': count, '👍': count }
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  const hasUserReacted = (emoji) => {
    return reactions.some(
      (r) => r.emoji === emoji && String(r.userId) === String(currentUserId)
    );
  };

  return (
    <div
      className={`group relative flex items-end mb-3 px-2 ${
        isSender ? 'justify-end' : 'justify-start'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Receiver Avatar */}
      {!isSender && (
        <img
          src={avatar || `https://ui-avatars.com/api/?background=random&size=128&rounded=true&name=${encodeURIComponent(displayHandle)}`}
          alt={displayHandle}
          className="w-8 h-8 rounded-full mr-2 mb-1 object-cover shadow-sm ring-1 ring-gray-200"
        />
      )}

      {/* Main Message Column */}
      <div
        className={`relative max-w-[85%] sm:max-w-md md:max-w-lg flex flex-col ${
          isSender ? 'items-end' : 'items-start'
        }`}
      >
        {/* Floating Quick Action Bar (on hover/focus) */}
        <div
          className={`absolute -top-9 z-20 transition-opacity duration-200 flex items-center bg-white/95 backdrop-blur-md border border-gray-200 shadow-md rounded-full px-2 py-0.5 space-x-1 ${
            showActions ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          } ${isSender ? 'right-0' : 'left-0'}`}
        >
          {/* Quick Reaction Emojis */}
          <div className="flex items-center space-x-0.5 border-r border-gray-200 pr-1 mr-1">
            {QUICK_REACTIONS.slice(0, 4).map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact && onReact(_id, emoji)}
                className={`text-sm p-1 rounded-full hover:scale-125 transition-transform ${
                  hasUserReacted(emoji) ? 'bg-indigo-100' : 'hover:bg-gray-100'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply */}
          <Tooltip title="Reply" arrow>
            <button
              type="button"
              onClick={() => onReply && onReply(msg)}
              className="p-1 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ReplyIcon sx={{ fontSize: 16 }} />
            </button>
          </Tooltip>

          {/* Copy Text */}
          {message && !deletedForEveryone && (
            <Tooltip title={copied ? 'Copied!' : 'Copy'} arrow>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ContentCopyIcon sx={{ fontSize: 15 }} />
              </button>
            </Tooltip>
          )}

          {/* Delete Message */}
          <Tooltip title="Delete" arrow>
            <button
              type="button"
              onClick={() => onDelete && onDelete(msg)}
              className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
            >
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </button>
          </Tooltip>
        </div>

        {/* Message Bubble Container */}
        <div
          className={`relative px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-150 ${
            isSender
              ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-xs'
              : 'bg-white text-gray-800 border border-gray-100/90 rounded-bl-xs'
          } ${deletedForEveryone ? 'italic opacity-70 bg-gray-100 text-gray-500 border border-gray-200' : ''}`}
        >
          {/* Quoted Reply Preview */}
          {replyTo && replyTo.message && (
            <div
              className={`mb-2 p-2 rounded-lg text-xs border-l-4 ${
                isSender
                  ? 'bg-indigo-700/50 border-white/80 text-indigo-100'
                  : 'bg-indigo-50/80 border-indigo-500 text-gray-700'
              }`}
            >
              <span className="font-semibold block truncate">
                {replyTo.senderName || 'Original Message'}
              </span>
              <p className="line-clamp-2 opacity-90">{replyTo.message}</p>
            </div>
          )}

          {/* Image Attachment */}
          {messageType === 'image' && fileUrl && !deletedForEveryone && (
            <div className="mb-2 overflow-hidden rounded-xl">
              <img
                src={fileUrl}
                alt="Shared attachment"
                className="max-h-64 sm:max-h-80 w-full object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => onImageClick && onImageClick(fileUrl)}
                loading="lazy"
              />
            </div>
          )}

          {/* Message Text */}
          {deletedForEveryone ? (
            <div className="flex items-center space-x-1.5 text-xs sm:text-sm py-0.5">
              <span>🚫 This message was deleted</span>
            </div>
          ) : (
            message && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words select-text font-normal">
                {message}
              </p>
            )
          )}

          {/* Timestamp and Status Checkmarks */}
          <div
            className={`flex items-center justify-end space-x-1 mt-1 text-[10px] sm:text-[11px] ${
              isSender ? 'text-indigo-200' : 'text-gray-400'
            }`}
          >
            <span>{time}</span>

            {/* Read Receipts for Sender */}
            {isSender && !deletedForEveryone && (
              <span className="flex items-center ml-0.5">
                {status === 'read' ? (
                  <DoneAllIcon
                    sx={{ fontSize: 14 }}
                    className="text-cyan-300 font-bold"
                  />
                ) : status === 'delivered' ? (
                  <DoneAllIcon sx={{ fontSize: 14 }} className="text-indigo-200" />
                ) : (
                  <DoneIcon sx={{ fontSize: 13 }} className="text-indigo-200" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Reaction Badges */}
        {Object.keys(reactionCounts).length > 0 && (
          <div
            className={`flex flex-wrap gap-1 mt-1 z-10 ${
              isSender ? 'justify-end mr-1' : 'justify-start ml-1'
            }`}
          >
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact && onReact(_id, emoji)}
                className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs shadow-xs border transition-transform hover:scale-110 ${
                  hasUserReacted(emoji)
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <span>{emoji}</span>
                {count > 1 && <span className="ml-1 text-[10px] font-semibold">{count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
