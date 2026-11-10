const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending',
    index: true,
  },
  message: {
    type: String,
    default: 'Sent you a chat invite',
    maxlength: 250,
  },
}, {
  timestamps: true,
});

// Prevent duplicate invites between the same sender and receiver
inviteSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
// Optimize queries for 1M DAU lookup scale
inviteSchema.index({ receiverId: 1, status: 1 });
inviteSchema.index({ senderId: 1, status: 1 });

const Invite = mongoose.model('Invite', inviteSchema);

module.exports = Invite;
