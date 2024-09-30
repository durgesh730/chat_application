const asyncHandler = require("../middleware/asyncHandler");
const { Message } = require("../models");

const allMesaage = asyncHandler(async (req, res) => {
    const messages = await Message.find({
        $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
        ],
    })
        .sort({ createdAt: 1 })
        .populate('senderId receiverId');

    return res.status(200).json({ success: true, data: messages });
})

const sendMessage = asyncHandler(async (req, res) => {
    const { receiverId, senderId, message } = req.body;

    // Basic validation
    if (!receiverId || !senderId || !message) {
        throw new ErrorResponse('Invalid data received', 400)
    }

    const newMessage = new Message({ receiverId, message, senderId });
    await newMessage.save();

    return res.status(200).json({ success: true, data: newMessage });
})

module.exports = { allMesaage, sendMessage }