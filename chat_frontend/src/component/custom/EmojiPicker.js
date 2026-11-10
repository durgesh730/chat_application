import React, { useState } from 'react';

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😋', '😜', '🤪', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🥺', '😢', '😭', '😤', '😡', '🤯', '😳', '🥵', '🥶', '😱', '🤫', '🤔'],
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👎', '👏', '🙌', '👐', '🤝', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🙏', '✍️'],
  },
  {
    name: 'Hearts & Love',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌'],
  },
  {
    name: 'Symbols & Fun',
    emojis: ['🔥', '✨', '⭐', '🌟', '💥', '🎉', '🎊', '🎈', '🎁', '🏆', '💯', '🎯', '🚀', '💡', '💬', '👀', '☕', '🍕', '🍻', '☀️', '🌙'],
  },
];

export const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

const EmojiPicker = ({ onSelectEmoji, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [search, setSearch] = useState('');

  const currentEmojis = search
    ? EMOJI_CATEGORIES.flatMap((c) => c.emojis).filter((e) => e.includes(search))
    : EMOJI_CATEGORIES[selectedCategory].emojis;

  return (
    <div className="absolute bottom-14 left-2 z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Emojis
        </span>
        <button
          onClick={onClose}
          type="button"
          className="text-gray-400 hover:text-gray-600 text-sm p-1 rounded-full hover:bg-gray-100"
        >
          ✕
        </button>
      </div>

      {/* Category selector */}
      <div className="flex space-x-1 mb-2 pb-1 border-b border-gray-50 overflow-x-auto hide-scrollbar">
        {EMOJI_CATEGORIES.map((cat, idx) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => {
              setSelectedCategory(idx);
              setSearch('');
            }}
            className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === idx && !search
                ? 'bg-indigo-100 text-indigo-700 font-medium'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto pr-1">
        {currentEmojis.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            type="button"
            onClick={() => {
              onSelectEmoji(emoji);
            }}
            className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-indigo-50 hover:scale-125 transition-transform"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
