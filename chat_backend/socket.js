const { Message } = require('./src/models');
const { Server } = require('socket.io');

const setupSocketIO = (server) => {
  const io = new Server(server, {
    pingTimeout: 30000, // 30 seconds timeout to detect client disconnection
    cors: {
      origin: '*', // Change this to your actual client origin in production
      methods: ['GET', 'POST', 'PUT', 'PATCH'],
    },
  });

  // Handle socket connection
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Utility function to generate consistent room ID
    const generateRoomId = (senderId, receiverId) => {
      return [senderId, receiverId].sort().join('-');
    };

    // Join a room based on receiverId and senderId
    socket.on('joinRoom', (receiverId, senderId) => {
      const roomId = generateRoomId(senderId, receiverId);
      socket.join(roomId);
      console.log(`User ${senderId} and ${receiverId} joined room ${roomId}`);
    });

    socket.on("typing", (receiverId, senderId) => {
      const roomId = generateRoomId(senderId, receiverId);
      socket.in(roomId).emit("typing")
    })

    socket.on("stop typing", (receiverId, senderId) => {
      const roomId = generateRoomId(senderId, receiverId);
      socket.in(roomId).emit("stop typing")
    })

    // When a new message is received, save to DB and emit to both users' room
    socket.on('newMessage', async (data) => {
      const { receiverId, senderId, message } = data;

      // Basic validation
      if (!receiverId || !senderId || !message) {
        socket.emit('error', { message: 'Invalid data received' });
        return;
      }

      if (receiverId === senderId) {
        socket.emit('error', { message: 'Self-messaging is not allowed' });
        return;
      }

      try {
        // Save message to MongoDB
        const newMessage = new Message({ receiverId, message, senderId });
        await newMessage.save();

        // Emit the message to the shared room
        const roomId = generateRoomId(senderId, receiverId);
        io.to(roomId).emit('messageReceived', newMessage);
        console.log(`Message sent from ${senderId} to ${receiverId}`);

      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error', { message: 'Error saving message' });
      }
    });

    // Fetch messages between two users with pagination
    socket.on('fetchMessages', async (data) => {
      const { receiverId, senderId } = data;

      if (!receiverId || !senderId) {
        socket.emit('error', { message: 'Invalid data received' });
        return;
      }

      try {
        const messages = await Message.find({
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        })
          .sort({ createdAt: 1 }) // Ascending order
          .populate('senderId receiverId'); // Populate user info if needed

        socket.emit('allMessages', messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        socket.emit('error', { message: 'Error fetching messages' });
      }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocketIO;
