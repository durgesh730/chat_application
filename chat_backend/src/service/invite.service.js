const mongoose = require('mongoose');
const { Invite, Auth } = require('../models');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * Send a chat invite from sender to receiver.
 */
const sendInvite = async (senderId, receiverId, message = 'Sent you a chat invite') => {
  if (!senderId || !receiverId) {
    throw new ErrorResponse('Sender and receiver IDs are required', 400);
  }

  if (String(senderId) === String(receiverId)) {
    throw new ErrorResponse('You cannot send a chat invite to yourself', 400);
  }

  const senderObjectId = new mongoose.Types.ObjectId(senderId);
  const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

  // Check if receiver exists
  const receiverExists = await Auth.findById(receiverObjectId).select('_id username uniqueId').lean();
  if (!receiverExists) {
    throw new ErrorResponse('User does not exist', 404);
  }

  // Check existing invite in either direction
  const existingInvite = await Invite.findOne({
    $or: [
      { senderId: senderObjectId, receiverId: receiverObjectId },
      { senderId: receiverObjectId, receiverId: senderObjectId },
    ],
  });

  if (existingInvite) {
    if (existingInvite.status === 'accepted') {
      return { success: true, status: 'accepted', invite: existingInvite, alreadyConnected: true };
    }

    if (existingInvite.status === 'blocked') {
      throw new ErrorResponse('Unable to send chat invite', 403);
    }

    // If reverse invite is already pending, accept it immediately
    if (String(existingInvite.senderId) === String(receiverId) && existingInvite.status === 'pending') {
      existingInvite.status = 'accepted';
      await existingInvite.save();
      await existingInvite.populate('senderId', 'username uniqueId profile_image isOnline lastSeen');
      await existingInvite.populate('receiverId', 'username uniqueId profile_image isOnline lastSeen');
      return { success: true, status: 'accepted', invite: existingInvite, autoAccepted: true };
    }

    // Already pending from current sender
    return { success: true, status: 'pending', invite: existingInvite, alreadySent: true };
  }

  // Create new invite
  const newInvite = new Invite({
    senderId: senderObjectId,
    receiverId: receiverObjectId,
    status: 'pending',
    message: (message || 'Sent you a chat invite').slice(0, 250),
  });

  await newInvite.save();
  await newInvite.populate('senderId', 'username uniqueId profile_image isOnline lastSeen');
  await newInvite.populate('receiverId', 'username uniqueId profile_image isOnline lastSeen');

  return { success: true, status: 'pending', invite: newInvite };
};

/**
 * Accept, reject, or block an incoming invite.
 */
const respondInvite = async (inviteId, userId, action) => {
  if (!inviteId || !action) {
    throw new ErrorResponse('Invite ID and action are required', 400);
  }

  const validActions = ['accept', 'reject', 'block'];
  if (!validActions.includes(action)) {
    throw new ErrorResponse('Invalid action. Must be accept, reject, or block', 400);
  }

  const invite = await Invite.findById(inviteId);
  if (!invite) {
    throw new ErrorResponse('Chat invite not found', 404);
  }

  // Only the recipient can accept or reject the invite
  if (String(invite.receiverId) !== String(userId)) {
    throw new ErrorResponse('You are not authorized to respond to this invite', 403);
  }

  if (action === 'accept') {
    invite.status = 'accepted';
    await invite.save();
  } else if (action === 'reject') {
    invite.status = 'rejected';
    await invite.save();
  } else if (action === 'block') {
    invite.status = 'blocked';
    await invite.save();
  }

  await invite.populate('senderId', 'username uniqueId profile_image isOnline lastSeen');
  await invite.populate('receiverId', 'username uniqueId profile_image isOnline lastSeen');

  return { success: true, status: invite.status, invite };
};

/**
 * Get all pending incoming invites for a user.
 */
const getPendingInvites = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const invites = await Invite.find({
    receiverId: userObjectId,
    status: 'pending',
  })
    .sort({ createdAt: -1 })
    .populate('senderId', 'username uniqueId profile_image isOnline lastSeen')
    .lean();

  return invites;
};

/**
 * Check connection / invite status between two users.
 */
const checkConnectionStatus = async (userId, targetUserId) => {
  if (!userId || !targetUserId) {
    return { status: 'none' };
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const targetObjectId = new mongoose.Types.ObjectId(targetUserId);

  const invite = await Invite.findOne({
    $or: [
      { senderId: userObjectId, receiverId: targetObjectId },
      { senderId: targetObjectId, receiverId: userObjectId },
    ],
  }).lean();

  if (!invite) {
    return { status: 'none' };
  }

  if (invite.status === 'accepted') {
    return { status: 'accepted', inviteId: invite._id };
  }

  if (invite.status === 'blocked') {
    return { status: 'blocked', inviteId: invite._id };
  }

  if (invite.status === 'pending') {
    if (String(invite.senderId) === String(userId)) {
      return { status: 'pending_sent', inviteId: invite._id, createdAt: invite.createdAt };
    } else {
      return {
        status: 'pending_received',
        inviteId: invite._id,
        message: invite.message,
        createdAt: invite.createdAt,
      };
    }
  }

  return { status: invite.status, inviteId: invite._id };
};

/**
 * Fast check: Is chat allowed between userA and userB?
 */
const isChatAllowed = async (userA, userB) => {
  if (!userA || !userB) return false;

  const objA = new mongoose.Types.ObjectId(userA);
  const objB = new mongoose.Types.ObjectId(userB);

  const invite = await Invite.findOne({
    $or: [
      { senderId: objA, receiverId: objB, status: 'accepted' },
      { senderId: objB, receiverId: objA, status: 'accepted' },
    ],
  })
    .select('_id')
    .lean();

  return !!invite;
};

/**
 * Get all connected users (accepted chat invites) for the current user.
 */
const getConnectedUsers = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const invites = await Invite.find({
    $or: [
      { senderId: userObjectId, status: 'accepted' },
      { receiverId: userObjectId, status: 'accepted' },
    ],
  })
    .sort({ updatedAt: -1 })
    .populate('senderId', 'username uniqueId profile_image isOnline lastSeen')
    .populate('receiverId', 'username uniqueId profile_image isOnline lastSeen')
    .lean();

  const connectedUsers = invites.map((inv) => {
    const isSender = String(inv.senderId?._id) === String(userId);
    return isSender ? inv.receiverId : inv.senderId;
  }).filter(Boolean);

  return connectedUsers;
};

module.exports = {
  sendInvite,
  respondInvite,
  getPendingInvites,
  checkConnectionStatus,
  isChatAllowed,
  getConnectedUsers,
};
