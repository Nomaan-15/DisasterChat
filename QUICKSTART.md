# 🚀 Quick Start Guide

Get DisasterNet running in 5 minutes!

## Step 1: Install Dependencies (First Time Only)

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Start the Application

### Terminal 1 - Backend
```bash
cd backend
npm start
```

**Expected Output:**
```
🚀 DisasterNet Server Started!
📡 Server: http://localhost:3001
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
➜  Local:   http://localhost:3000/
➜  Network: http://192.168.1.100:3000/
```

## Step 3: Open in Browser

1. Open browser: `http://localhost:3000`
2. Enter your name (e.g., "John")
3. Keep default room: "disaster-room"
4. Click "Join Chat Room"

## Step 4: Connect Another Device (Optional)

### On the same WiFi network:

1. Find your computer's IP address:
   - **Windows**: Run `ipconfig` in Command Prompt
   - **Mac/Linux**: Run `ifconfig` in Terminal
   - Look for something like `192.168.1.100`

2. On another device (phone/tablet/computer):
   - Connect to same WiFi
   - Open browser: `http://192.168.1.100:3000`
   - Enter server: `http://192.168.1.100:3001`
   - Join with a different name
   - Use same room name: "disaster-room"

## Step 5: Start Chatting!

- Type messages in the text box
- Press Enter or click Send button
- See messages appear in real-time
- Check the sidebar for online users

---

## 🎯 Testing Locally (Single Computer)

Open multiple browser tabs/windows:
1. Tab 1: Join as "Alice"
2. Tab 2: Join as "Bob"
3. Send messages between them

---

## ⚡ Quick Commands Cheat Sheet

```bash
# Install everything at once (from project root)
cd backend && npm install && cd ../frontend && npm install && cd ..

# Start backend
cd backend && npm start

# Start frontend (new terminal)
cd frontend && npm run dev

# Stop servers
Press Ctrl+C in each terminal
```

---

## 🐛 Common Issues

**"Port already in use"**
```bash
# Change the port
PORT=4000 npm start
```

**"Can't connect from other device"**
- Make sure both devices are on the same WiFi
- Check firewall settings
- Use the correct IP address

**"npm: command not found"**
- Install Node.js from https://nodejs.org/

---

## 🎉 You're All Set!

Your offline emergency chat system is now running. In a real disaster scenario:
1. One person runs the server (needs laptop + battery)
2. Creates WiFi hotspot (no internet needed)
3. Everyone connects and coordinates

**Happy chatting! 💬**
