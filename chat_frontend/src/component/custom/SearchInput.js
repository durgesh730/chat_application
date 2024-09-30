import React from 'react';
import SearchIcon from '@mui/icons-material/Search';

const SearchInput = ({ search, onchange }) => {
    return (
        <div className="relative">
            <div className="flex items-center border border-gray-300 rounded-full mt-2">
                <SearchIcon className="h-5 w-5 text-gray-500 absolute left-2 ml-2" />
                <input
                    type="text"
                    id="search"
                    placeholder="Search"
                    className="w-full p-2 pl-12 border-0 rounded-full focus:ring-0"
                    name="telephone"
                    value={search}
                    onChange={onchange}
                />
            </div>
        </div>
    );
};

export default SearchInput;
