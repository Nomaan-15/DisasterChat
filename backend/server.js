const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const Bonjour = require('bonjour');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

// ✅ UPDATED: Proper CORS configuration for production
const allowedOrigins = [
  'http://localhost:5173',           // Local development
  'http://localhost:3000',           // Alternative local port
  process.env.FRONTEND_URL,          // Your Netlify URL from environment variable
];

// Filter out undefined values
const validOrigins = allowedOrigins.filter(Boolean);

const io = socketIO(server, {
  cors: {
    origin: validOrigins.length > 0 ? validOrigins : "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: validOrigins.length > 0 ? validOrigins : "*",
  credentials: true
}));
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3001;
const ROOM_NAME = process.env.ROOM || 'disaster-room';
const SERVICE_TYPE = 'disasternet-chat';

// Store connected users
const users = new Map();
const messageHistory = [];
const LOG_FILE = path.join(__dirname, 'chat-logs.txt');

// mDNS Service Discovery
const bonjour = Bonjour();

// Publish this service on the local network
const service = bonjour.publish({
  name: `DisasterNet-${PORT}`,
  type: SERVICE_TYPE,
  port: PORT,
  txt: {
    room: ROOM_NAME
  }
});

console.log(`📡 Broadcasting service on local network...`);

// Discover other DisasterNet instances
const browser = bonjour.find({ type: SERVICE_TYPE });

browser.on('up', (service) => {
  console.log(`✅ Found peer: ${service.name} at ${service.host}:${service.port}`);
});

// Helper function to log messages
function logMessage(data) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${data.username}: ${data.message}\n`;
  fs.appendFileSync(LOG_FILE, logEntry);
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // User joins with a username
  socket.on('join', ({ username, room }) => {
    socket.join(room);
    users.set(socket.id, { username, room, id: socket.id });
    
    console.log(`✅ ${username} joined room: ${room}`);

    // Send message history to the new user
    socket.emit('message-history', messageHistory);

    // Notify others about new user
    socket.to(room).emit('user-joined', {
      username,
      timestamp: new Date().toISOString(),
      userCount: users.size
    });

    // Send updated user list
    const roomUsers = Array.from(users.values()).filter(u => u.room === room);
    io.to(room).emit('user-list', roomUsers);
  });

  // Handle incoming messages
  socket.on('send-message', (data) => {
    const user = users.get(socket.id);
    
    if (user) {
      const messageData = {
        id: Date.now().toString(),
        username: user.username,
        message: data.message,
        timestamp: new Date().toISOString(),
        room: user.room
      };

      // Store in history
      messageHistory.push(messageData);
      
      // Keep only last 1000 messages
      if (messageHistory.length > 1000) {
        messageHistory.shift();
      }

      // Log to file
      logMessage(messageData);

      // Broadcast to all users in the room
      io.to(user.room).emit('receive-message', messageData);
      
      console.log(`💬 ${user.username}: ${data.message}`);
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.room).emit('user-typing', {
        username: user.username,
        isTyping: data.isTyping
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    
    if (user) {
      console.log(`❌ ${user.username} disconnected`);
      
      socket.to(user.room).emit('user-left', {
        username: user.username,
        timestamp: new Date().toISOString()
      });

      users.delete(socket.id);

      // Send updated user list
      const roomUsers = Array.from(users.values()).filter(u => u.room === user.room);
      io.to(user.room).emit('user-list', roomUsers);
    }
  });
});

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    users: users.size,
    room: ROOM_NAME,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/messages', (req, res) => {
  res.json(messageHistory);
});

app.get('/api/users', (req, res) => {
  const userList = Array.from(users.values());
  res.json(userList);
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 DisasterNet Server Started!');
  console.log('================================');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🏠 Room: ${ROOM_NAME}`);
  console.log(`📝 Logs: ${LOG_FILE}`);
  console.log('================================');
  console.log(`🌐 Allowed origins: ${validOrigins.join(', ')}`);
  console.log('================================\n');
  console.log('💡 Others can connect using your local IP address');
  console.log('   Find your IP: ipconfig (Windows) or ifconfig (Mac/Linux)\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  service.stop();
  bonjour.destroy();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});