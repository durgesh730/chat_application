const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  emoji: {
    type: String,
    required: true,
  },
}, { _id: false });

const replyToSchema = new mongoose.Schema({
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  message: {
    type: String,
    default: '',
  },
  senderName: {
    type: String,
    default: '',
  },
}, { _id: false });

const messageSchema = new mongoose.Schema({
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  message: {
    type: String,
    default: '',
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
  },
  fileUrl: {
    type: String,
    default: null,
  },
  fileName: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  },
  replyTo: {
    type: replyToSchema,
    default: null,
  },
  reactions: {
    type: [reactionSchema],
    default: [],
  },
  deletedForEveryone: {
    type: Boolean,
    default: false,
  },
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }],
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexing for rapid queries
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
messageSchema.index({ receiverId: 1, status: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
