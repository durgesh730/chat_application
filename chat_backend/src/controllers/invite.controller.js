const asyncHandler = require('../middleware/asyncHandler');
const { InviteServices } = require('../service');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * Send a chat invite to a user.
 */
const sendInvite = asyncHandler(async (req, res) => {
  const senderId = req.user_detail._id;
  const { receiverId, message } = req.body;

  if (!receiverId) {
    throw new ErrorResponse('receiverId is required', 400);
  }

  const result = await InviteServices.sendInvite(senderId, receiverId, message);
  return res.status(201).json(result);
});

/**
 * Accept, reject, or block a chat invite.
 */
const respondInvite = asyncHandler(async (req, res) => {
  const userId = req.user_detail._id;
  const { inviteId, action } = req.body;

  if (!inviteId || !action) {
    throw new ErrorResponse('inviteId and action (accept, reject, block) are required', 400);
  }

  const result = await InviteServices.respondInvite(inviteId, userId, action);
  return res.status(200).json(result);
});

/**
 * Get all pending incoming chat invites for logged-in user.
 */
const getPendingInvites = asyncHandler(async (req, res) => {
  const userId = req.user_detail._id;
  const invites = await InviteServices.getPendingInvites(userId);
  return res.status(200).json({ success: true, count: invites.length, data: invites });
});

/**
 * Check connection / invite status with a target user.
 */
const getStatus = asyncHandler(async (req, res) => {
  const userId = req.user_detail._id;
  const { targetUserId } = req.params;

  if (!targetUserId) {
    throw new ErrorResponse('targetUserId is required', 400);
  }

  const result = await InviteServices.checkConnectionStatus(userId, targetUserId);
  return res.status(200).json({ success: true, data: result });
});

/**
 * Get all accepted connections for logged-in user.
 */
const getConnections = asyncHandler(async (req, res) => {
  const userId = req.user_detail._id;
  const connections = await InviteServices.getConnectedUsers(userId);
  return res.status(200).json({ success: true, count: connections.length, data: connections });
});

module.exports = {
  sendInvite,
  respondInvite,
  getPendingInvites,
  getStatus,
  getConnections,
};
