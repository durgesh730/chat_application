import React from "react";

const Message = ({ isSender, message, time, avatar, name }) => {
    return (
        <div className={`flex items-start mb-4 ${isSender ? "justify-end" : ""}`}>
            {!isSender && (
                <img
                    src={avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full mr-3"
                />
            )}
            <div className={`max-w-xs ${isSender ? "text-right" : "text-left"}`}>
                {!isSender && (
                    <span className="block font-bold text-sm text-gray-600">{name}</span>
                )}
                <div
                    className={`py-2 px-4 rounded-lg shadow-md ${isSender ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-800"
                        }`}
                >
                    <p>{message}</p>
                </div>
                <span className="block text-xs text-gray-400 mt-1">{time}</span>
            </div>
            {isSender && (
                <img
                    src={avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full ml-3"
                />
            )}
        </div>
    );
};

export default Message;
