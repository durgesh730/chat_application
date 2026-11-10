const { Server } = require('socket.io');
const { Message, Auth, Invite } = require('./src/models');
const { MessageServices, InviteServices } = require('./src/service');

const setupSocketIO = (server) => {
  const io = new Server(server, {
    pingTimeout: 45000,
    pingInterval: 25000,
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    // Scale optimization for high concurrency
    maxHttpBufferSize: 5e6, // 5MB buffer
  });

  // Track online users: userId -> Set of socket IDs
  const onlineUsers = new Map();
  // Map socket.id -> userId for quick reverse lookup on disconnect
  const socketUserMap = new Map();

  // Rate Limiting Map: socket.id -> array of timestamps (1M DAU anti-spam protection)
  const rateLimitMap = new Map();

  const isRateLimited = (socketId) => {
    const now = Date.now();
    const timestamps = rateLimitMap.get(socketId) || [];
    // Keep timestamps from the last 3 seconds
    const recent = timestamps.filter((t) => now - t < 3000);
    recent.push(now);
    rateLimitMap.set(socketId, recent);
    return recent.length > 15; // More than 15 actions in 3 seconds = throttled
  };

  // Helper to generate consistent room ID for 1-to-1 chat
  const generateRoomId = (senderId, receiverId) => {
    return [String(senderId), String(receiverId)].sort().join('-');
  };

  io.on('connection', (socket) => {
    console.log(`[Socket] Connection established: ${socket.id}`);

    // Register user when they connect with their unique userId
    socket.on('registerUser', async (userId) => {
      if (!userId) return;
      const strUserId = String(userId);

      socketUserMap.set(socket.id, strUserId);

      if (!onlineUsers.has(strUserId)) {
        onlineUsers.set(strUserId, new Set());
      }
      onlineUsers.get(strUserId).add(socket.id);

      // Join a personal room for private notifications & invites
      socket.join(`user_${strUserId}`);

      // Broadcast user is online
      io.emit('userOnline', { userId: strUserId });

      // Send the list of currently online users to the connecting client
      socket.emit('getOnlineUsers', Array.from(onlineUsers.keys()));

      // Update online status in database
      try {
        await Auth.findByIdAndUpdate(strUserId, {
          isOnline: true,
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error('[Socket] Error updating user online status:', err.message);
      }
    });

    // Request active online users
    socket.on('requestOnlineUsers', () => {
      socket.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
    });

    // ==========================================
    // CHAT INVITE / CONNECTION SYSTEM (Instagram Style)
    // ==========================================

    // Send a chat invite
    socket.on('sendChatInvite', async (data, callback) => {
      const { senderId, receiverId, message } = data;
      if (!senderId || !receiverId) return;

      if (isRateLimited(socket.id)) {
        if (callback) callback({ error: 'Too many requests. Please slow down.' });
        return;
      }

      try {
        const result = await InviteServices.sendInvite(senderId, receiverId, message);

        // Notify the receiver in their personal room
        io.to(`user_${String(receiverId)}`).emit('newChatInvite', {
          invite: result.invite,
          sender: result.invite.senderId,
        });

        if (callback) callback({ success: true, data: result });
      } catch (err) {
        console.error('[Socket] Error sending chat invite:', err.message);
        if (callback) callback({ error: err.message });
      }
    });

    // Respond to chat invite (Accept / Reject)
    socket.on('respondChatInvite', async (data, callback) => {
      const { inviteId, userId, action } = data;
      if (!inviteId || !userId || !action) return;

      try {
        const result = await InviteServices.respondInvite(inviteId, userId, action);
        const { invite } = result;

        if (action === 'accept') {
          // Emit to both users so their chat rooms unlock in real-time
          io.to(`user_${String(invite.senderId._id || invite.senderId)}`).emit('chatInviteAccepted', {
            invite,
            partner: invite.receiverId,
          });
          io.to(`user_${String(invite.receiverId._id || invite.receiverId)}`).emit('chatInviteAccepted', {
            invite,
            partner: invite.senderId,
          });
        } else if (action === 'reject') {
          io.to(`user_${String(invite.senderId._id || invite.senderId)}`).emit('chatInviteRejected', {
            inviteId,
          });
        }

        if (callback) callback({ success: true, data: result });
      } catch (err) {
        console.error('[Socket] Error responding to chat invite:', err.message);
        if (callback) callback({ error: err.message });
      }
    });

    // Check connection status between two users
    socket.on('checkInviteStatus', async (data, callback) => {
      const { senderId, receiverId } = data;
      if (!senderId || !receiverId) return;

      try {
        const statusData = await InviteServices.checkConnectionStatus(senderId, receiverId);
        if (callback) callback({ success: true, data: statusData });
      } catch (err) {
        if (callback) callback({ error: err.message });
      }
    });

    // ==========================================
    // 1-TO-1 CHAT ROOM & MESSAGING
    // ==========================================

    // Join 1-to-1 chat room (only if invite is accepted)
    socket.on('joinRoom', async (receiverId, senderId) => {
      if (!receiverId || !senderId) return;

      // Verify connection before joining
      const isAllowed = await InviteServices.isChatAllowed(senderId, receiverId);
      if (!isAllowed) {
        socket.emit('roomJoinDenied', {
          receiverId,
          message: 'Chat invite has not been accepted yet',
        });
        return;
      }

      const roomId = generateRoomId(senderId, receiverId);
      socket.join(roomId);
      console.log(`[Socket] Authorized room joined: ${roomId} by ${senderId}`);

      // Mark unread messages as read
      try {
        const updateResult = await MessageServices.markMessagesAsRead(senderId, receiverId);
        if (updateResult && updateResult.modifiedCount > 0) {
          io.to(roomId).emit('messagesRead', {
            readBy: senderId,
            senderId: receiverId,
          });
        }
      } catch (err) {
        console.error('[Socket] Error marking messages read on join:', err.message);
      }
    });

    // Typing indicators
    socket.on('typing', (receiverId, senderId) => {
      if (!receiverId || !senderId) return;
      const roomId = generateRoomId(senderId, receiverId);
      socket.to(roomId).emit('typing', { senderId });
    });

    socket.on('stop typing', (receiverId, senderId) => {
      if (!receiverId || !senderId) return;
      const roomId = generateRoomId(senderId, receiverId);
      socket.to(roomId).emit('stop typing', { senderId });
    });

    // Send a new message (strict check: chat invite must be accepted)
    socket.on('newMessage', async (data, callback) => {
      if (isRateLimited(socket.id)) {
        if (callback) callback({ error: 'Message rate limit exceeded. Please wait.' });
        socket.emit('error', { message: 'Message rate limit exceeded. Please wait.' });
        return;
      }

      const {
        receiverId,
        senderId,
        message = '',
        messageType = 'text',
        fileUrl = null,
        fileName = null,
        replyTo = null,
      } = data;

      if (!receiverId || !senderId || (!message && !fileUrl)) {
        if (callback) callback({ error: 'Invalid message data' });
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }

      if (String(receiverId) === String(senderId)) {
        if (callback) callback({ error: 'Self-messaging is not allowed' });
        socket.emit('error', { message: 'Self-messaging is not allowed' });
        return;
      }

      try {
        // Enforce: has the chat invite been accepted?
        const isAllowed = await InviteServices.isChatAllowed(senderId, receiverId);
        if (!isAllowed) {
          const errText = 'Chat invite must be accepted before messages can be sent';
          if (callback) callback({ error: errText });
          socket.emit('error', { message: errText });
          return;
        }

        const isReceiverOnline = onlineUsers.has(String(receiverId));
        const status = isReceiverOnline ? 'delivered' : 'sent';

        const savedMessage = await MessageServices.sendMessage({
          senderId,
          receiverId,
          message,
          messageType,
          fileUrl,
          fileName,
          replyTo,
          status,
        });

        const roomId = generateRoomId(senderId, receiverId);

        // Emit to the conversation room
        io.to(roomId).emit('messageReceived', savedMessage);

        // Also emit notification to receiver's personal room for sidebar badge/sound
        io.to(`user_${String(receiverId)}`).emit('messageNotification', savedMessage);

        if (callback) callback({ success: true, message: savedMessage });
      } catch (error) {
        console.error('[Socket] Error saving message:', error.message);
        if (callback) callback({ error: error.message || 'Error sending message' });
        socket.emit('error', { message: error.message || 'Error sending message' });
      }
    });

    // Mark messages as read explicitly
    socket.on('markAsRead', async (data) => {
      const { receiverId, senderId } = data;
      if (!receiverId || !senderId) return;

      try {
        await MessageServices.markMessagesAsRead(senderId, receiverId);
        const roomId = generateRoomId(senderId, receiverId);
        io.to(roomId).emit('messagesRead', {
          readBy: senderId,
          senderId: receiverId,
        });
      } catch (error) {
        console.error('[Socket] Error in markAsRead:', error.message);
      }
    });

    // React to a message
    socket.on('reactMessage', async (data) => {
      const { messageId, userId, emoji, receiverId } = data;
      if (!messageId || !userId || !emoji) return;

      try {
        const updated = await MessageServices.reactMessage(messageId, userId, emoji);
        const roomId = generateRoomId(userId, receiverId);
        io.to(roomId).emit('messageReacted', {
          messageId,
          reactions: updated.reactions,
        });
      } catch (error) {
        console.error('[Socket] Error reacting to message:', error.message);
      }
    });

    // Delete a message
    socket.on('deleteMessage', async (data) => {
      const { messageId, senderId, receiverId, deleteForEveryone } = data;
      if (!messageId || !senderId) return;

      try {
        const result = await MessageServices.deleteMessage(
          messageId,
          senderId,
          deleteForEveryone
        );
        const roomId = generateRoomId(senderId, receiverId);
        io.to(roomId).emit('messageDeleted', {
          messageId,
          deleteForEveryone: result.deletedForEveryone,
          senderId,
        });
      } catch (error) {
        console.error('[Socket] Error deleting message:', error.message);
      }
    });

    // Clear chat between two users
    socket.on('clearChat', async (data) => {
      const { senderId, receiverId } = data;
      if (!senderId || !receiverId) return;

      try {
        await MessageServices.clearChat(senderId, receiverId);
        socket.emit('chatCleared', { clearedBy: senderId });
      } catch (error) {
        console.error('[Socket] Error clearing chat:', error.message);
      }
    });

    // Fetch previous messages with pagination
    socket.on('fetchMessages', async (data) => {
      const { receiverId, senderId, limit = 40, before = null } = data;
      if (!receiverId || !senderId) return;

      try {
        // Only return messages if chat invite is accepted
        const isAllowed = await InviteServices.isChatAllowed(senderId, receiverId);
        if (!isAllowed) {
          socket.emit('allMessages', []);
          return;
        }

        const messages = await MessageServices.getMessages(senderId, receiverId, {
          limit,
          before,
        });

        // Mark unread messages sent by receiverId as read
        await MessageServices.markMessagesAsRead(senderId, receiverId);

        socket.emit('allMessages', messages);

        // Notify room that messages were read
        const roomId = generateRoomId(senderId, receiverId);
        socket.to(roomId).emit('messagesRead', {
          readBy: senderId,
          senderId: receiverId,
        });
      } catch (error) {
        console.error('[Socket] Error fetching messages:', error.message);
        socket.emit('error', { message: 'Error fetching messages' });
      }
    });

    // Handle user disconnect
    socket.on('disconnect', async () => {
      const userId = socketUserMap.get(socket.id);
      socketUserMap.delete(socket.id);
      rateLimitMap.delete(socket.id);

      if (userId && onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId);
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          const now = new Date();

          io.emit('userOffline', { userId, lastSeen: now });

          try {
            await Auth.findByIdAndUpdate(userId, {
              isOnline: false,
              lastSeen: now,
            });
          } catch (err) {
            console.error('[Socket] Error updating user offline status:', err.message);
          }
        }
      }

      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocketIO;
