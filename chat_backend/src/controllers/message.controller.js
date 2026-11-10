const asyncHandler = require('../middleware/asyncHandler');
const { MessageServices } = require('../service');
const { uploadImage } = require('../helpers/cloudinaryUploader');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * Get all messages between logged-in user and specified receiver.
 */
const allMessage = asyncHandler(async (req, res) => {
  const userId = req.user_detail._id;
  const receiverId = req.query.receiverId;
  const { limit, before } = req.query;

  if (!receiverId) {
    throw new ErrorResponse('Receiver ID is required in query params', 400);
  }

  const messages = await MessageServices.getMessages(userId, receiverId, { limit, before });
  return res.status(200).json({ success: true, count: messages.length, data: messages });
});

/**
 * Send a message via REST.
 */
const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user_detail._id;
  const { receiverId, message, messageType, fileUrl, fileName, replyTo } = req.body;

  const newMessage = await MessageServices.sendMessage({
    senderId,
    receiverId,
    message,
    messageType,
    fileUrl,
    fileName,
    replyTo,
  });

  return res.status(201).json({ success: true, data: newMessage });
});

/**
 * Upload an image/file to Cloudinary.
 */
const uploadMedia = asyncHandler(async (req, res) => {
  const { fileData } = req.body;

  if (!fileData) {
    throw new ErrorResponse('fileData (base64 string or url) is required', 400);
  }

  const result = await uploadImage(fileData, {
    folder: 'chat_attachments',
  });

  return res.status(200).json({
    success: true,
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    },
  });
});

/**
 * Clear chat history between current user and receiver.
 */
const clearChat = asyncHandler(async (req, res) => {
  const userId = req.user_detail._id;
  const { receiverId } = req.body;

  if (!receiverId) {
    throw new ErrorResponse('Receiver ID is required', 400);
  }

  const result = await MessageServices.clearChat(userId, receiverId);
  return res.status(200).json(result);
});

/**
 * Delete a message (for everyone or for me).
 */
const deleteMessage = asyncHandler(async (req, res) => {
  const userId = req.user_detail._id;
  const { id } = req.params;
  const { deleteForEveryone } = req.body;

  const result = await MessageServices.deleteMessage(id, userId, deleteForEveryone);
  return res.status(200).json(result);
});

/**
 * React to a message.
 */
const reactMessage = asyncHandler(async (req, res) => {
  const userId = req.user_detail._id;
  const { id } = req.params;
  const { emoji } = req.body;

  if (!emoji) {
    throw new ErrorResponse('Emoji is required', 400);
  }

  const updatedMessage = await MessageServices.reactMessage(id, userId, emoji);
  return res.status(200).json({ success: true, data: updatedMessage });
});

/**
 * Get recent conversations summary for the current user.
 */
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user_detail._id;
  const conversations = await MessageServices.getRecentConversations(userId);
  return res.status(200).json({ success: true, data: conversations });
});

module.exports = {
  allMessage,
  sendMessage,
  uploadMedia,
  clearChat,
  deleteMessage,
  reactMessage,
  getConversations,
};
