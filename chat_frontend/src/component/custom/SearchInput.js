import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

const SearchInput = ({ search = '', onchange, onClear, placeholder = 'Search users or chats...' }) => {
  return (
    <div className="relative w-full">
      <div className="flex items-center bg-gray-100 hover:bg-gray-150 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 border border-gray-200/80 rounded-xl transition-all duration-200">
        <SearchIcon className="h-5 w-5 text-gray-400 ml-3" />
        <input
          type="text"
          id="search"
          placeholder={placeholder}
          className="w-full py-2.5 px-3 bg-transparent text-sm text-gray-800 placeholder-gray-400 border-0 focus:outline-none focus:ring-0"
          value={search}
          onChange={onchange}
        />
        {search && (
          <button
            type="button"
            onClick={onClear}
            className="mr-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
