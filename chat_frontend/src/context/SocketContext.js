import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { socketUrl } from '../helper/fetcher';
import { useAuth } from './AuthContext';
import { playIncomingMessageSound } from '../helper/sound';
import fetcher from '../helper/fetcher';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, receiver } = useAuth();
  const socketRef = useRef(null);
  const userRef = useRef(user);
  userRef.current = user;

  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [recentConversations, setRecentConversations] = useState({});
  const [pendingInvites, setPendingInvites] = useState([]);
  const [connectedUserIds, setConnectedUserIds] = useState(new Set());

  // Fetch pending chat invites
  const fetchPendingInvites = useCallback(() => {
    if (!userRef.current?._id) return;
    fetcher
      .get('/invite/pending')
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setPendingInvites(res.data.data);
        }
      })
      .catch((err) => {
        console.log('[Socket] Pending invites fetch error:', err.message);
      });
  }, []);

  // Fetch accepted connections
  const fetchConnectedUsers = useCallback(() => {
    if (!userRef.current?._id) return;
    fetcher
      .get('/invite/connections')
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          const ids = new Set(res.data.data.map((u) => String(u._id)));
          setConnectedUserIds(ids);
        }
      })
      .catch((err) => {
        console.log('[Socket] Connected users fetch error:', err.message);
      });
  }, []);

  // Initialize socket connection once
  useEffect(() => {
    const socket = io(socketUrl, {
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected to server:', socket.id);
      setIsConnected(true);
      if (userRef.current?._id) {
        socket.emit('registerUser', userRef.current._id);
      }
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
      setIsConnected(false);
    });

    // Handle online users list
    socket.on('getOnlineUsers', (users) => {
      setOnlineUsers(users.map(String));
    });

    socket.on('userOnline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const idStr = String(userId);
        return prev.includes(idStr) ? prev : [...prev, idStr];
      });
    });

    socket.on('userOffline', ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== String(userId)));
    });

    // Listen for new chat invites (Instagram DM request style)
    socket.on('newChatInvite', ({ invite }) => {
      setPendingInvites((prev) => [invite, ...prev.filter((i) => i._id !== invite._id)]);
      playIncomingMessageSound();
    });

    // Listen for invite accepted (unlocks chat in real-time)
    socket.on('chatInviteAccepted', ({ invite, partner }) => {
      const partnerId = String(partner?._id || partner);
      setConnectedUserIds((prev) => new Set([...prev, partnerId]));
      setPendingInvites((prev) => prev.filter((i) => i._id !== invite._id));
      playIncomingMessageSound();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // When user signs in, register socket and fetch conversation summaries & invites
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && user?._id) {
      socketRef.current.emit('registerUser', user._id);
      socketRef.current.emit('requestOnlineUsers');
    }

    if (user?._id) {
      fetchPendingInvites();
      fetchConnectedUsers();

      fetcher
        .get('/message/conversations')
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            const map = {};
            const unreads = {};
            res.data.data.forEach((conv) => {
              const partnerId = String(conv._id);
              map[partnerId] = {
                lastMessage:
                  conv.lastMessage ||
                  (conv.lastMessageType === 'image' ? '📷 Photo' : 'Attachment'),
                lastMessageTime: conv.lastMessageTime,
                lastMessageType: conv.lastMessageType,
                lastSenderId: conv.lastSenderId,
              };
              if (conv.unreadCount > 0) {
                unreads[partnerId] = conv.unreadCount;
              }
            });
            setRecentConversations((prev) => ({ ...map, ...prev }));
            setUnreadCounts((prev) => ({ ...unreads, ...prev }));
          }
        })
        .catch((err) => {
          console.log('[Socket] Initial conversation sync:', err.message);
        });
    }
  }, [user?._id, fetchPendingInvites, fetchConnectedUsers]);

  // Global message notification handler
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNotification = (message) => {
      const senderId =
        typeof message.senderId === 'object' ? message.senderId._id : message.senderId;

      setRecentConversations((prev) => ({
        ...prev,
        [String(senderId)]: {
          lastMessage:
            message.message ||
            (message.messageType === 'image' ? '📷 Photo' : 'Attachment'),
          lastMessageTime: message.createdAt || message.timestamp || new Date().toISOString(),
          lastMessageType: message.messageType,
          lastSenderId: senderId,
        },
      }));

      const currentReceiverId = receiver?._id ? String(receiver._id) : null;
      if (String(senderId) !== currentReceiverId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [String(senderId)]: (prev[String(senderId)] || 0) + 1,
        }));
        playIncomingMessageSound();
      }
    };

    socket.on('messageNotification', handleNotification);

    return () => {
      socket.off('messageNotification', handleNotification);
    };
  }, [receiver]);

  const isUserOnline = useCallback(
    (userId) => {
      if (!userId) return false;
      return onlineUsers.includes(String(userId));
    },
    [onlineUsers]
  );

  const resetUnreadForUser = useCallback((userId) => {
    if (!userId) return;
    setUnreadCounts((prev) => {
      const copy = { ...prev };
      delete copy[String(userId)];
      return copy;
    });
  }, []);

  const updateRecentConversation = useCallback((userId, data) => {
    if (!userId) return;
    setRecentConversations((prev) => ({
      ...prev,
      [String(userId)]: {
        ...prev[String(userId)],
        ...data,
      },
    }));
  }, []);

  // Send a chat invite helper
  const sendInvite = useCallback(
    (receiverId, message = 'Sent you a chat invite') => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current || !user?._id) {
          return reject(new Error('Socket not connected'));
        }

        socketRef.current.emit(
          'sendChatInvite',
          { senderId: user._id, receiverId, message },
          (response) => {
            if (response?.error) {
              reject(new Error(response.error));
            } else {
              resolve(response?.data);
            }
          }
        );
      });
    },
    [user?._id]
  );

  // Respond to invite helper (accept / reject)
  const respondInvite = useCallback(
    (inviteId, action) => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current || !user?._id) {
          return reject(new Error('Socket not connected'));
        }

        socketRef.current.emit(
          'respondChatInvite',
          { inviteId, userId: user._id, action },
          (response) => {
            if (response?.error) {
              reject(new Error(response.error));
            } else {
              if (action === 'accept') {
                const partnerId =
                  response?.data?.invite?.senderId?._id ||
                  response?.data?.invite?.senderId;
                if (partnerId) {
                  setConnectedUserIds((prev) => new Set([...prev, String(partnerId)]));
                }
              }
              setPendingInvites((prev) => prev.filter((i) => i._id !== inviteId));
              resolve(response?.data);
            }
          }
        );
      });
    },
    [user?._id]
  );

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        onlineUsers,
        isUserOnline,
        unreadCounts,
        setUnreadCounts,
        resetUnreadForUser,
        recentConversations,
        setRecentConversations,
        updateRecentConversation,
        pendingInvites,
        pendingInvitesCount: pendingInvites.length,
        fetchPendingInvites,
        connectedUserIds,
        fetchConnectedUsers,
        sendInvite,
        respondInvite,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
