import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, Users, Menu, Radio, Wifi } from 'lucide-react';

function App() {
  // State management
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  
  // User state
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('disaster-room');
  const [users, setUsers] = useState([]);
  
  // Message state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // ✅ UPDATED: Use environment variable with fallback to localhost
  const [serverUrl, setServerUrl] = useState(
    import.meta.env.VITE_API_URL || 'http://localhost:3001'
  );
  
  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);
  const socketRef = useRef(null);  // Keep a ref to the socket

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect to server
  const connectToServer = () => {
    console.log('🔌 Connecting to server:', serverUrl);
    
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Store in ref immediately
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('✅ Connected to server! Socket ID:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
      setHasJoined(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setIsConnected(false);
    });

    // Receive message history
    newSocket.on('message-history', (history) => {
      console.log('📚 Received message history:', history.length, 'messages');
      setMessages(history);
    });

    // Receive new messages
    newSocket.on('receive-message', (data) => {
      console.log('💬 New message:', data);
      setMessages(prev => [...prev, data]);
    });

    // User joined
    newSocket.on('user-joined', (data) => {
      console.log('✅ User joined:', data.username);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        message: `${data.username} joined the chat`,
        timestamp: data.timestamp
      }]);
    });

    // User left
    newSocket.on('user-left', (data) => {
      console.log('❌ User left:', data.username);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        message: `${data.username} left the chat`,
        timestamp: data.timestamp
      }]);
    });

    // User list update
    newSocket.on('user-list', (userList) => {
      console.log('👥 Updated user list:', userList.length, 'users');
      setUsers(userList);
    });

    // Typing indicator
    newSocket.on('user-typing', (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => new Set([...prev, data.username]));
      } else {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.username);
          return newSet;
        });
      }
    });

    setSocket(newSocket);
    return newSocket;
  };

  // Join chat room - FIXED VERSION
  const handleJoin = (e) => {
    e.preventDefault();
    
    if (!username.trim() || !room.trim()) {
      alert('Please enter your name and room');
      return;
    }

    console.log('🚀 Joining room:', { username, room });

    // If socket doesn't exist, create it
    if (!socketRef.current || !socketRef.current.connected) {
      const newSocket = connectToServer();
      
      // Wait for connection, then join
      newSocket.on('connect', () => {
        console.log('✅ Connected! Now joining room...');
        newSocket.emit('join', { username: username.trim(), room: room.trim() });
        setHasJoined(true);
      });
    } else {
      // Socket already connected, just join
      console.log('✅ Already connected! Joining room...');
      socketRef.current.emit('join', { username: username.trim(), room: room.trim() });
      setHasJoined(true);
    }
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socketRef.current) {
      console.log('📤 Sending message:', newMessage);
      socketRef.current.emit('send-message', { message: newMessage });
      setNewMessage('');
      messageInputRef.current?.focus();
      
      // Stop typing indicator
      socketRef.current.emit('typing', { isTyping: false });
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socketRef.current) {
      socketRef.current.emit('typing', { isTyping: true });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('typing', { isTyping: false });
      }, 1000);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get user initials
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Login Screen
  if (!hasJoined) {
    return (
      <div className="login-container">
        <h1>
          <Radio size={32} />
          DisasterNet
        </h1>
        <p>Offline-first emergency communication system</p>
        
        {isConnected ? (
          <div className="status-badge">
            <div className="status-dot"></div>
            Connected
          </div>
        ) : (
          <div className="status-badge" style={{ background: '#ef4444' }}>
            <Wifi size={12} />
            Connecting...
          </div>
        )}

        <form onSubmit={handleJoin}>
          <div className="input-group">
            <label>Server Address</label>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="https://your-backend.onrender.com"
            />
            <small style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Default: {import.meta.env.VITE_API_URL || 'http://localhost:3001'}
            </small>
          </div>

          <div className="input-group">
            <label>Your Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="input-group">
            <label>Room Name</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="disaster-room"
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Join Chat Room
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '12px', color: '#9ca3af' }}>
          💡 Connected to: {serverUrl}
        </p>
      </div>
    );
  }

  // Chat Screen
  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </button>
          <div>
            <h2>DisasterNet Chat</h2>
            <div className="room-badge">{room}</div>
          </div>
        </div>
        <div className="header-right">
          <div className="user-count">
            <Users size={16} />
            {users.length} online
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="chat-layout">
        {/* Sidebar */}
        <div className={`sidebar ${!sidebarOpen ? 'hidden' : ''}`}>
          <div className="sidebar-header">
            <h3>Active Users</h3>
          </div>
          <div className="user-list">
            {users.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                No users online
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="user-item">
                  <div className="user-avatar">
                    {getInitials(user.username)}
                    <div className="online-indicator"></div>
                  </div>
                  <div className="user-info">
                    <div className="username">
                      {user.username}
                      {user.username === username && ' (You)'}
                    </div>
                    <div className="status">Online</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="messages-area">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#9ca3af', 
                marginTop: '40px',
                fontSize: '14px' 
              }}>
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => {
                if (msg.type === 'system') {
                  return (
                    <div key={msg.id} className="system-message">
                      {msg.message}
                    </div>
                  );
                }

                const isOwn = msg.username === username;

                return (
                  <div key={msg.id} className={`message ${isOwn ? 'own' : ''}`}>
                    <div className="message-avatar">
                      {getInitials(msg.username)}
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-username">{msg.username}</span>
                        <span className="message-time">{formatTime(msg.timestamp)}</span>
                      </div>
                      <div className="message-bubble">
                        <div className="message-text">{msg.message}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          {typingUsers.size > 0 && (
            <div className="typing-indicator">
              <div className="typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="input-area">
            <textarea
              ref={messageInputRef}
              className="message-input"
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows="1"
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={!newMessage.trim()}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;