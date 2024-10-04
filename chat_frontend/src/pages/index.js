import io from 'socket.io-client';
import Message from "../features/Message";
import { Drawer } from '@mui/material';
import { useAuth } from "../context/AuthContext";
import LongMenu from "../component/custom/LongMenu";
import ProfileUI from '../component/ui/profileUI.js/ProfileUI';
import React, { useEffect, useRef, useState, useCallback } from "react";

const socket = io('http://localhost:5500');
// const socket = io('https://chat-application-1-b4z4.onrender.com');

const Chat = () => {
  const { receiver, user } = useAuth();
  const senderId = user._id;
  const receiverId = receiver?._id;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [openDrawer, setOpenDrawer] = useState(false)
  const [typing, setTyping] = useState(false)
  const [t, setT] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user || !receiver) {
      return;
    }

    // Join the chat room
    socket.emit('joinRoom', receiverId, senderId);

    // Fetch all previous messages
    socket.emit('fetchMessages', { receiverId, senderId });

    // Listener for previous messages
    socket.on('allMessages', (msgs) => {
      setMessages(msgs.map(msg => ({
        isSender: msg.senderId._id === senderId,
        name: msg.senderId._id === senderId ? 'You' : receiver?.name,
        message: msg.message,
        time: new Date(msg.timestamp).toLocaleTimeString().slice(0, 5),
        avatar: msg.senderId._id === senderId ? user?.profile_image : receiver?.profile_image
      })));
    });

    // Listener for new incoming messages
    socket.on('messageReceived', (newMessage) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          isSender: newMessage.senderId === senderId,
          name: newMessage.senderId === senderId ? 'You' : receiver?.name,
          message: newMessage.message,
          time: new Date(newMessage.timestamp).toLocaleTimeString().slice(0, 5),
          avatar: newMessage.senderId === senderId ? user?.profile_image : receiver?.profile_image
        }
      ]);
    });

    // Cleanup socket listeners on unmount
    return () => {
      socket.off('messageReceived');
      socket.off('allMessages');
    };
  }, [user, receiver]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  useEffect(() => {
    socket.on("typing", () => setTyping(true))
    socket.on("stop typing", () => setTyping(false))
  }, [])

  // Optimized handleSendMessage to prevent unnecessary re-renders
  const handleSendMessage = useCallback((event) => {
    if (event?.key === "Enter" || event?.type === "click") {
      if (inputMessage.trim()) {
        const newMessage = {
          receiverId,
          senderId,
          message: inputMessage,
        };

        // Emit the new message
        socket.emit('newMessage', newMessage, (error) => {
          if (error) {
            console.error("Message sending failed", error);
          }
        });

        // Emit stop typing
        socket.emit("stop typing", receiverId, senderId);
        setT(false);  // Reset typing state

        // Clear input after sending
        setInputMessage("");
      }
    }
  }, [inputMessage, receiverId, senderId]);

  const handleSendMSG = (e) => {
    const messageValue = e.target.value;

    if (!t) {
      setT(true);
      socket.emit("typing", receiverId, senderId);
    }

    if (messageValue.trim() === "") {
      setT(false);
      socket.emit("stop typing", receiverId, senderId);
    }

    setInputMessage(messageValue);
  };

  const handleOptions = (option) => {
    setOpenDrawer(true)
  };

  const options = [
    { id: 1, title: 'Info', color: 'black', line: true },
    { id: 2, title: 'Clear Chat', color: 'black', line: false },
  ];

  return (
    <>
      <div className="sticky py-2 px-2 top-0 flex items-center justify-between rounded-md space-x-3 mb-2 shadow-xl bg-white">
        <div className=" flex items-center gap-2 ">
          <img
            src={receiver?.profile_image}
            alt={receiver?.name || "User"}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <span className="text-md font-semibold">{receiver?.name}</span><br />
            {
              typing && <span className="text-xs text-green-500">Typing...</span>
            }
          </div>
        </div>

        <LongMenu options={options} handleOptions={handleOptions} />
      </div>

      <div className="flex h-screen flex-col px-6 pb-4 pt-4">
        <div className="flex-1 overflow-y-auto mb-4">
          {messages.map((msg, index) => (
            <Message
              key={index}
              isSender={msg.isSender}
              name={msg.name}
              message={msg.message}
              time={msg.time}
              avatar={msg.avatar}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="sticky bottom-4 flex items-center space-x-2">
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type your message here..."
            value={inputMessage}
            onKeyDown={handleSendMessage}
            onChange={handleSendMSG}
          />
          <button
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>

      <Drawer PaperProps={{
        sx: { minWidth: "30%" }
      }}
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}>
        <ProfileUI
          profile={receiver}
        />
      </Drawer>
    </>
  );
};

export default Chat;
