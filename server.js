const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store active users in each event room
const eventRooms = {};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining event
  socket.on('joinEvent', ({ userName, userId, eventId }) => {
    console.log(`User ${userName} (${userId}) joined event ${eventId}`);
    
    // Join the socket room for this event
    socket.join(eventId);
    
    // Store user info
    if (!eventRooms[eventId]) {
      eventRooms[eventId] = [];
    }
    
    const userInfo = {
      id: userId,
      name: userName,
      socketId: socket.id
    };
    
    eventRooms[eventId].push(userInfo);
    
    // Notify other users that someone joined
    io.to(eventId).emit('userJoined', {
      user: userInfo,
      participants: eventRooms[eventId],
      message: `${userName} has joined the event`
    });
  });

  // Handle chat messages
  socket.on('chatMessage', ({ eventId, userId, userName, message }) => {
    const timestamp = new Date().toISOString();
    
    // Broadcast the message to all users in the event
    io.to(eventId).emit('newMessage', {
      userId,
      userName,
      message,
      timestamp
    });
  });

  // Handle user leaving
  socket.on('leaveEvent', ({ eventId, userId, userName }) => {
    if (eventRooms[eventId]) {
      // Remove user from the room array
      eventRooms[eventId] = eventRooms[eventId].filter(user => user.id !== userId);
      
      // Notify others that user has left
      io.to(eventId).emit('userLeft', {
        userId,
        userName,
        participants: eventRooms[eventId],
        message: `${userName} has left the event`
      });
    }
    
    // Leave the socket room
    socket.leave(eventId);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find which rooms this socket was in
    Object.keys(eventRooms).forEach(eventId => {
      const user = eventRooms[eventId].find(u => u.socketId === socket.id);
      
      if (user) {
        // Remove user from the room
        eventRooms[eventId] = eventRooms[eventId].filter(u => u.socketId !== socket.id);
        
        // Notify others
        io.to(eventId).emit('userLeft', {
          userId: user.id,
          userName: user.name,
          participants: eventRooms[eventId],
          message: `${user.name} has disconnected`
        });
      }
    });
  });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});