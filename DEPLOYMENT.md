# 🚨 Deployment Guide for Disaster Scenarios

This guide explains how to deploy DisasterNet in real emergency situations.

## 📦 Equipment Needed

### Minimum Setup
- 1 laptop with Node.js installed
- 1 smartphone (for WiFi hotspot)
- Portable battery pack
- Pre-installed DisasterNet software

### Recommended Setup
- 1 laptop/tablet with DisasterNet server
- 1 portable WiFi router (battery powered)
- Multiple smartphones for team members
- Solar panel or generator for extended operations
- Backup battery packs

## 🎯 Deployment Scenarios

### Scenario 1: Phone Hotspot (Quick Deploy)

**Best for:** Small teams, immediate response

1. **Setup Phone Hotspot**
   - Turn on phone hotspot (no internet needed)
   - Name: "DisasterNet-Emergency"
   - Password: Simple but secure

2. **Start Server on Laptop**
   ```bash
   cd backend
   PORT=3001 ROOM=emergency npm start
   ```

3. **Connect Team Devices**
   - Connect to "DisasterNet-Emergency" WiFi
   - Open browser: http://192.168.x.x:3000
   - Enter server: http://192.168.x.x:3001

**Range:** ~50 meters
**Users:** Up to 10-15
**Battery Life:** 4-6 hours

---

### Scenario 2: Portable Router (Extended Range)

**Best for:** Command centers, larger teams

1. **Setup WiFi Router**
   - Battery-powered travel router
   - DO NOT connect to internet
   - Configure SSID: "Emergency-Ops"

2. **Connect Laptop to Router**
   - Connect via ethernet or WiFi
   - Get IP address (e.g., 192.168.1.100)

3. **Start Server**
   ```bash
   cd backend
   npm start
   ```

4. **Deploy to Team**
   - Distribute connection info on paper
   - Server: http://192.168.1.100:3001
   - Room: "rescue-ops"

**Range:** ~100 meters
**Users:** Up to 50+
**Battery Life:** 8-12 hours with good router

---

### Scenario 3: Building LAN (Fixed Location)

**Best for:** Emergency operation centers, shelters

1. **Use Existing Network Infrastructure**
   - Building's WiFi (even without internet)
   - Or create new network with available equipment

2. **Setup Server on Fixed Computer**
   ```bash
   PORT=80 npm start  # Use port 80 for easy access
   ```

3. **Post Instructions**
   - Print and post connection instructions
   - Simple URL: http://emergency-server
   - QR code for mobile access

**Range:** Entire building
**Users:** Unlimited
**Reliability:** Very high

---

## 🔧 Pre-Deployment Preparation

### 1. Software Installation

**Install on laptop BEFORE disaster:**
```bash
# Install Node.js
# Download from: https://nodejs.org/

# Clone/download DisasterNet
cd /path/to/disasternet-chat

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Test run
cd backend && npm start
cd frontend && npm run dev
```

### 2. Create Portable Package

**Build a ready-to-deploy USB drive:**
```
USB-DisasterNet/
├── node_modules/ (pre-installed)
├── backend/
├── frontend/
├── START_SERVER.bat (Windows)
├── START_SERVER.sh (Mac/Linux)
└── INSTRUCTIONS.txt
```

**START_SERVER.bat (Windows):**
```batch
@echo off
cd backend
start cmd /k "npm start"
timeout /t 3
cd ../frontend
start cmd /k "npm run dev"
```

**START_SERVER.sh (Mac/Linux):**
```bash
#!/bin/bash
cd backend
npm start &
sleep 3
cd ../frontend
npm run dev
```

### 3. Print Emergency Cards

Create cards with connection info:
```
┌─────────────────────────────────┐
│     EMERGENCY COMMUNICATIONS     │
├─────────────────────────────────┤
│ Network: DisasterNet-Emergency   │
│ Password: [write in]            │
│                                 │
│ Server: http://192.168.___:3001 │
│ Room: emergency                 │
│                                 │
│ Your Name: ________________     │
└─────────────────────────────────┘
```

---

## 📱 Mobile-First Deployment

### For Teams Using Mostly Phones

1. **Setup Instructions (Print & Laminate)**
   ```
   STEP 1: Connect to WiFi "DisasterNet"
   STEP 2: Open browser (Chrome/Safari)
   STEP 3: Go to: 192.168.1.100:3000
   STEP 4: Enter your name and click Join
   ```

2. **Battery Management**
   - Enable low power mode
   - Reduce screen brightness
   - Close other apps
   - Carry portable chargers

3. **Connectivity**
   - Stay within 50m of router/hotspot
   - Move to higher ground if needed
   - Minimize obstacles (walls, buildings)

---

## ⚡ Power Management

### Battery Life Estimates

**Laptop as Server:**
- MacBook Pro: 8-10 hours
- Windows Laptop: 5-8 hours
- With external battery: 20+ hours

**Phone as Hotspot:**
- iPhone: 4-6 hours
- Android: 3-5 hours
- With battery pack: 12+ hours

**Portable Router:**
- Typical router: 6-10 hours
- High-capacity: 12-24 hours

### Power Optimization

**Server Settings:**
```bash
# Reduce logging for battery savings
# Edit server.js and comment out:
# fs.appendFileSync(LOG_FILE, logEntry);
```

**Client Settings:**
- Lower screen brightness
- Enable power-saving mode
- Close other apps/tabs

---

## 🔐 Security in Disasters

### Access Control

**Simple Password Protection (Add to server.js):**
```javascript
const ROOM_PASSWORD = 'rescue2024';

socket.on('join', ({ username, room, password }) => {
  if (password !== ROOM_PASSWORD) {
    socket.emit('error', 'Invalid password');
    return;
  }
  // ... rest of join logic
});
```

### Room Separation

Create separate rooms for different teams:
- `command-center` - Leadership
- `medical-team` - Medical personnel
- `search-rescue` - Search and rescue
- `logistics` - Supply coordination

---

## 📊 Monitoring & Logs

### Check System Health

**Server Status:**
```bash
# View active connections
curl http://localhost:3001/api/health

# View user list
curl http://localhost:3001/api/users

# View message history
curl http://localhost:3001/api/messages
```

**Message Logs:**
All messages saved to `chat-logs.txt`:
```
[2024-01-09T10:30:45.123Z] Commander: Team Alpha, proceed to sector 5
[2024-01-09T10:31:12.456Z] Alpha-Lead: Roger, en route
```

---

## 🚨 Emergency Scenarios

### Total Power Loss
**Backup Plan:**
1. Switch to battery-powered router
2. Use phones as clients only
3. One phone as server (limited)
4. Fall back to radio communication

### Server Crash
**Recovery:**
1. Keep backup laptop ready
2. USB drive with pre-installed software
3. Message history preserved in logs
4. Quick restart: `npm start`

### Network Congestion
**Solutions:**
1. Limit users per room to 30-40
2. Create multiple rooms by location
3. Designate message priority channels
4. Use concise messages only

---

## 📋 Pre-Deployment Checklist

**Equipment:**
- [ ] Laptop with DisasterNet installed
- [ ] Portable WiFi router or phone hotspot
- [ ] Battery packs fully charged
- [ ] Backup power (solar panel/generator)
- [ ] Printed connection instructions

**Software:**
- [ ] Node.js installed
- [ ] DisasterNet dependencies installed
- [ ] Server tested and working
- [ ] Frontend tested and working
- [ ] Logs directory writable

**Communication:**
- [ ] Team trained on basic usage
- [ ] Connection instructions distributed
- [ ] Backup communication plan ready
- [ ] Emergency contacts list

**Documentation:**
- [ ] IP address documented
- [ ] Room names assigned
- [ ] Access codes distributed
- [ ] Troubleshooting guide available

---

## 🎓 Training Recommendations

### Basic Training (15 minutes)
1. How to connect to WiFi
2. How to access the app
3. How to send messages
4. How to check online users

### Advanced Training (1 hour)
1. How to start the server
2. How to troubleshoot issues
3. How to manage power
4. How to create backup systems

---

## 📞 Support Resources

**In the Field:**
- Refer to this guide
- Check QUICKSTART.md
- Review troubleshooting section
- Designate a tech-savvy team member

**After Deployment:**
- Document what worked
- Note improvements needed
- Share learnings with other teams
- Update equipment as needed

---

## 🌟 Best Practices

1. **Always have a backup** - Second laptop, USB drive, printed instructions
2. **Test before disaster** - Run drills with your team
3. **Keep it simple** - Focus on core messaging functionality
4. **Document everything** - Write down IPs, passwords, configurations
5. **Train multiple people** - Don't rely on one technical person
6. **Preserve battery** - Plan for extended operations
7. **Stay organized** - Use clear room names and user names
8. **Have fallbacks** - Radio, runners, other communication methods

---

**Remember: In a disaster, communication saves lives. Test your system regularly and train your team thoroughly.**

*Stay safe. Stay connected. Stay coordinated.*
