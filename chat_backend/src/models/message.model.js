const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  receiverId: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
    required: true
  },
  senderId: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
