const mongoose = require('mongoose');
const { Message, Invite } = require('../models');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * Get messages between two users with pagination (1M DAU optimized).
 */
const getMessages = async (userId, receiverId, options = {}) => {
  if (!userId || !receiverId) {
    throw new ErrorResponse('User IDs are required', 400);
  }

  const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 40));
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

  const query = {
    $or: [
      { senderId: userObjectId, receiverId: receiverObjectId },
      { senderId: receiverObjectId, receiverId: userObjectId },
    ],
    deletedBy: { $ne: userObjectId },
  };

  if (options.before) {
    query.createdAt = { $lt: new Date(options.before) };
  }

  // Fast index-backed lean query for massive concurrency
  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('senderId', 'username uniqueId profile_image isOnline lastSeen')
    .populate('receiverId', 'username uniqueId profile_image isOnline lastSeen')
    .lean();

  return messages.reverse();
};

/**
 * Save and send a new message.
 * Enforces Instagram-style chat invite acceptance.
 */
const sendMessage = async ({
  senderId,
  receiverId,
  message = '',
  messageType = 'text',
  fileUrl = null,
  fileName = null,
  replyTo = null,
  status = 'sent',
}) => {
  if (!senderId || !receiverId) {
    throw new ErrorResponse('Sender and receiver IDs are required', 400);
  }

  if (senderId.toString() === receiverId.toString()) {
    throw new ErrorResponse('Self-messaging is not allowed', 400);
  }

  if (!message && !fileUrl) {
    throw new ErrorResponse('Message or file is required', 400);
  }

  const senderObjectId = new mongoose.Types.ObjectId(senderId);
  const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

  // Strict check: has chat invite been accepted?
  const isAccepted = await Invite.findOne({
    $or: [
      { senderId: senderObjectId, receiverId: receiverObjectId, status: 'accepted' },
      { senderId: receiverObjectId, receiverId: senderObjectId, status: 'accepted' },
    ],
  })
    .select('_id')
    .lean();

  if (!isAccepted) {
    throw new ErrorResponse('Chat invite must be accepted before messages can be exchanged', 403);
  }

  const newMessage = new Message({
    senderId: senderObjectId,
    receiverId: receiverObjectId,
    message,
    messageType,
    fileUrl,
    fileName,
    replyTo: replyTo && replyTo.messageId ? replyTo : null,
    status,
    timestamp: new Date(),
  });

  await newMessage.save();

  await newMessage.populate('senderId', 'username uniqueId profile_image isOnline lastSeen');
  await newMessage.populate('receiverId', 'username uniqueId profile_image isOnline lastSeen');

  return newMessage;
};

/**
 * Mark messages as read between two users.
 */
const markMessagesAsRead = async (senderId, receiverId) => {
  if (!senderId || !receiverId) return { modifiedCount: 0 };

  const result = await Message.updateMany(
    {
      senderId: new mongoose.Types.ObjectId(receiverId),
      receiverId: new mongoose.Types.ObjectId(senderId),
      status: { $ne: 'read' },
    },
    {
      $set: { status: 'read' },
    }
  );

  return result;
};

/**
 * Add or toggle emoji reaction on a message.
 */
const reactMessage = async (messageId, userId, emoji) => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new ErrorResponse('Message not found', 404);
  }

  const existingReactionIndex = message.reactions.findIndex(
    (r) => r.userId.toString() === userId.toString()
  );

  if (existingReactionIndex > -1) {
    if (message.reactions[existingReactionIndex].emoji === emoji) {
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      message.reactions[existingReactionIndex].emoji = emoji;
    }
  } else {
    message.reactions.push({
      userId: new mongoose.Types.ObjectId(userId),
      emoji,
    });
  }

  await message.save();
  return message;
};

/**
 * Delete a message (either for everyone or just for the requesting user).
 */
const deleteMessage = async (messageId, userId, deleteForEveryone = false) => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new ErrorResponse('Message not found', 404);
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  if (deleteForEveryone) {
    if (message.senderId.toString() !== userId.toString()) {
      throw new ErrorResponse('Only the sender can delete a message for everyone', 403);
    }
    message.deletedForEveryone = true;
    message.message = 'This message was deleted';
    message.fileUrl = null;
    message.fileName = null;
    await message.save();
    return { success: true, messageId, deletedForEveryone: true, message };
  } else {
    if (!message.deletedBy.some((id) => id.toString() === userId.toString())) {
      message.deletedBy.push(userObjectId);
      await message.save();
    }
    return { success: true, messageId, deletedForEveryone: false };
  }
};

/**
 * Clear chat between two users for the current user.
 */
const clearChat = async (userId, receiverId) => {
  if (!userId || !receiverId) {
    throw new ErrorResponse('User IDs are required', 400);
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

  await Message.updateMany(
    {
      $or: [
        { senderId: userObjectId, receiverId: receiverObjectId },
        { senderId: receiverObjectId, receiverId: userObjectId },
      ],
      deletedBy: { $ne: userObjectId },
    },
    {
      $addToSet: { deletedBy: userObjectId },
    }
  );

  return { success: true, message: 'Chat cleared successfully' };
};

/**
 * Get summary of recent conversations for the logged in user (last message, unread count).
 * Optimized aggregate query with indexed match.
 */
const getRecentConversations = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ senderId: userObjectId }, { receiverId: userObjectId }],
        deletedBy: { $ne: userObjectId },
      },
    },
    {
      $sort: { createdAt: -1, timestamp: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$senderId', userObjectId] },
            '$receiverId',
            '$senderId',
          ],
        },
        lastMessage: { $first: '$message' },
        lastMessageType: { $first: '$messageType' },
        lastMessageTime: { $first: { $ifNull: ['$createdAt', '$timestamp'] } },
        lastSenderId: { $first: '$senderId' },
        status: { $first: '$status' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiverId', userObjectId] },
                  { $ne: ['$status', 'read'] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return conversations;
};

module.exports = {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  reactMessage,
  deleteMessage,
  clearChat,
  getRecentConversations,
};
