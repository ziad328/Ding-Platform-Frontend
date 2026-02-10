# Chat System API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [WebSocket Events](#websocket-events)
5. [Frontend Setup Guide](#frontend-setup-guide)
6. [Complete Examples](#complete-examples)

---

## Overview

This chat system supports:
- **Direct Messages** (1-on-1 conversations)
- **Group Chats** (multiple participants)
- **Media Sharing** (images, videos, documents)
- **Real-time Updates** (via WebSocket)

**Base URL:** `http://your-api-domain.com`

**WebSocket URL:** `ws://your-api-domain.com/chat`

---

## Authentication

All API requests require authentication. Include the JWT token in the request headers:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## API Endpoints

### 1. Create Chat Room

**Purpose:** Create a new chat room (direct or group chat)

**Endpoint:** `POST /chat/rooms`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Weekend Trip Planning",
  "userIds": ["user-id-1", "user-id-2", "user-id-3"],
  "type": "GROUP"
}
```

**Field Descriptions:**
- `name` (string, optional): Room name. Required for GROUP, ignored for DIRECT
- `userIds` (array, required): Array of user IDs to add to the room
  - For DIRECT: Include exactly 1 user ID (the other person)
  - For GROUP: Include 1 or more user IDs
- `type` (string, optional): Either "DIRECT" or "GROUP". Default is "DIRECT"

**Success Response (201 Created):**
```json
{
  "id": "room-123",
  "type": "GROUP",
  "name": "Weekend Trip Planning",
  "createdAt": "2026-02-08T10:30:00Z",
  "updatedAt": "2026-02-08T10:30:00Z",
  "members": [
    {
      "id": "member-1",
      "userId": "current-user-id",
      "role": "ADMIN",
      "user": {
        "id": "current-user-id",
        "name": "John Doe",
        "image": "https://example.com/avatar1.jpg"
      }
    },
    {
      "id": "member-2",
      "userId": "user-id-1",
      "role": "MEMBER",
      "user": {
        "id": "user-id-1",
        "name": "Jane Smith",
        "image": "https://example.com/avatar2.jpg"
      }
    }
  ]
}
```

**Error Responses:**

*401 Unauthorized:*
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

*400 Bad Request:*
```json
{
  "statusCode": 400,
  "message": ["userIds must be an array", "userIds should not be empty"],
  "error": "Bad Request"
}
```

**Limits:**
- Maximum 100 members per group chat
- Direct chats limited to 2 participants

---

### 2. Get User's Chat Rooms

**Purpose:** Get all chat rooms the current user is part of

**Endpoint:** `GET /chat/rooms`

**Authentication:** Required

**Request Body:** None

**Query Parameters:** None

**Success Response (200 OK):**
```json
[
  {
    "id": "room-123",
    "type": "GROUP",
    "name": "Weekend Trip Planning",
    "createdAt": "2026-02-08T10:30:00Z",
    "updatedAt": "2026-02-08T11:45:00Z",
    "members": [
      {
        "id": "member-1",
        "userId": "current-user-id",
        "role": "ADMIN",
        "user": {
          "id": "current-user-id",
          "name": "John Doe",
          "image": "https://example.com/avatar1.jpg"
        }
      },
      {
        "id": "member-2",
        "userId": "user-id-1",
        "role": "MEMBER",
        "user": {
          "id": "user-id-1",
          "name": "Jane Smith",
          "image": "https://example.com/avatar2.jpg"
        }
      }
    ],
    "messages": [
      {
        "id": "msg-456",
        "content": "See you tomorrow!",
        "createdAt": "2026-02-08T11:45:00Z",
        "user": {
          "name": "Jane Smith"
        }
      }
    ]
  },
  {
    "id": "room-456",
    "type": "DIRECT",
    "name": null,
    "createdAt": "2026-02-07T14:20:00Z",
    "updatedAt": "2026-02-08T09:15:00Z",
    "members": [
      {
        "id": "member-3",
        "userId": "current-user-id",
        "role": "ADMIN",
        "user": {
          "id": "current-user-id",
          "name": "John Doe",
          "image": "https://example.com/avatar1.jpg"
        }
      },
      {
        "id": "member-4",
        "userId": "user-id-2",
        "role": "MEMBER",
        "user": {
          "id": "user-id-2",
          "name": "Bob Johnson",
          "image": "https://example.com/avatar3.jpg"
        }
      }
    ],
    "messages": [
      {
        "id": "msg-789",
        "content": "Thanks for your help!",
        "createdAt": "2026-02-08T09:15:00Z",
        "user": {
          "name": "Bob Johnson"
        }
      }
    ]
  }
]
```

**Error Responses:**

*401 Unauthorized:*
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Limits:**
- Returns all rooms (no pagination in current implementation)

---

### 3. Send Message

**Purpose:** Send a text message or media to a chat room

**Endpoint:** `POST /chat/rooms/:roomId/messages`

**Authentication:** Required

**URL Parameters:**
- `roomId` (required): The ID of the chat room

**Request Type:** `multipart/form-data`

**Request Fields:**

**Text Message Only:**
```
content: "Hello everyone!"
replyToId: "msg-123" (optional)
```

**Message with Images:**
```
content: "Check out these photos!"
images: [File, File, File] (max 5 files)
replyToId: "msg-456" (optional)
```

**Message with Videos:**
```
content: "Here's the video from yesterday"
videos: [File, File] (max 2 files)
```

**Message with Documents:**
```
content: "Attached the PDF"
files: [File, File] (max 5 files)
```

**Field Descriptions:**
- `content` (string, required): The message text
- `replyToId` (string, optional): ID of message being replied to
- `images` (files, optional): Image files (max 5, each max 20MB)
- `videos` (files, optional): Video files (max 2, each max 20MB)
- `files` (files, optional): Document files (max 5, each max 20MB)

**Allowed File Types:**
- Images: `.png`, `.jpg`, `.jpeg`
- Videos: `.mp4`

**Success Response (201 Created):**
```json
{
  "id": "msg-999",
  "content": "Check out these photos!",
  "userId": "current-user-id",
  "roomId": "room-123",
  "replyToId": null,
  "createdAt": "2026-02-08T12:00:00Z",
  "updatedAt": "2026-02-08T12:00:00Z",
  "media": [
    {
      "type": "IMAGE",
      "url": "https://cloudinary.com/image1.jpg",
      "publicId": "chats/room-123/msg-999/image1"
    },
    {
      "type": "IMAGE",
      "url": "https://cloudinary.com/image2.jpg",
      "publicId": "chats/room-123/msg-999/image2"
    }
  ]
}
```

**Error Responses:**

*401 Unauthorized:*
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

*400 Bad Request (Invalid file type):*
```json
{
  "statusCode": 400,
  "message": "Invalid file type",
  "error": "Bad Request"
}
```

*413 Payload Too Large:*
```json
{
  "statusCode": 413,
  "message": "File too large",
  "error": "Payload Too Large"
}
```

**Limits:**
- Maximum 5 images per message
- Maximum 2 videos per message
- Maximum 5 document files per message
- Each file maximum 20MB

---

### 4. Get Messages

**Purpose:** Retrieve messages from a chat room

**Endpoint:** `GET /chat/rooms/:roomId/messages`

**Authentication:** Required

**URL Parameters:**
- `roomId` (required): The ID of the chat room

**Query Parameters:**
- Currently no pagination parameters (returns last 20 messages)

**Success Response (200 OK):**
```json
[
  {
    "id": "msg-999",
    "content": "See you tomorrow!",
    "userId": "user-id-1",
    "roomId": "room-123",
    "replyToId": null,
    "createdAt": "2026-02-08T12:00:00Z",
    "updatedAt": "2026-02-08T12:00:00Z"
  },
  {
    "id": "msg-998",
    "content": "That sounds great!",
    "userId": "current-user-id",
    "roomId": "room-123",
    "replyToId": "msg-997",
    "createdAt": "2026-02-08T11:55:00Z",
    "updatedAt": "2026-02-08T11:55:00Z"
  },
  {
    "id": "msg-997",
    "content": "Let's meet at 2 PM",
    "userId": "user-id-2",
    "roomId": "room-123",
    "replyToId": null,
    "createdAt": "2026-02-08T11:50:00Z",
    "updatedAt": "2026-02-08T11:50:00Z"
  }
]
```

**Error Responses:**

*401 Unauthorized:*
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

*404 Not Found:*
```json
{
  "statusCode": 404,
  "message": "Room not found",
  "error": "Not Found"
}
```

**Limits:**
- Returns last 20 messages only
- Messages ordered by newest first

---

### 5. Add Member to Room

**Purpose:** Add a new member to a group chat

**Endpoint:** `POST /chat/rooms/:roomId/members`

**Authentication:** Required (must be admin)

**URL Parameters:**
- `roomId` (required): The ID of the chat room

**Request Body:**
```json
{
  "userId": "user-id-4"
}
```

**Field Descriptions:**
- `userId` (string, required): ID of user to add to the room

**Success Response (201 Created):**
```json
{
  "id": "member-10",
  "userId": "user-id-4",
  "roomId": "room-123",
  "role": "MEMBER",
  "joinedAt": "2026-02-08T13:00:00Z",
  "user": {
    "id": "user-id-4",
    "name": "Alice Cooper",
    "email": "alice@example.com",
    "image": "https://example.com/avatar4.jpg"
  },
  "room": {
    "id": "room-123",
    "name": "Weekend Trip Planning",
    "type": "GROUP"
  }
}
```

**Error Responses:**

*401 Unauthorized:*
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

*403 Forbidden:*
```json
{
  "statusCode": 403,
  "message": "Only admins can add members",
  "error": "Forbidden"
}
```

*400 Bad Request:*
```json
{
  "statusCode": 400,
  "message": "User already in room",
  "error": "Bad Request"
}
```

**Limits:**
- Only available for GROUP chats
- Requester must be an admin

---

### 6. Remove Member from Room

**Purpose:** Remove a member from a group chat

**Endpoint:** `DELETE /chat/rooms/:roomId/members/:userId`

**Authentication:** Required (must be admin or removing yourself)

**URL Parameters:**
- `roomId` (required): The ID of the chat room
- `userId` (required): The ID of the user to remove

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "count": 1
}
```

**Error Responses:**

*401 Unauthorized:*
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

*403 Forbidden:*
```json
{
  "statusCode": 403,
  "message": "Permission denied",
  "error": "Forbidden"
}
```

*404 Not Found:*
```json
{
  "statusCode": 404,
  "message": "Member not found",
  "error": "Not Found"
}
```

**Limits:**
- Can remove yourself from any room
- Need admin role to remove others

---

## WebSocket Events

### Connection

**URL:** `ws://your-api-domain.com/chat`

**Namespace:** `/chat`

### Events You Can Send (Client → Server)

#### 1. Join Room

**Event Name:** `joinRoom`

**Purpose:** Join a chat room to receive real-time messages

**Payload:**
```json
{
  "roomId": "room-123"
}
```

**Response:**
```json
{
  "event": "joinedRoom",
  "data": "room-123"
}
```

**Example Usage:**
```javascript
socket.emit('joinRoom', { roomId: 'room-123' });
```

---

#### 2. Leave Room

**Event Name:** `leaveRoom`

**Purpose:** Leave a chat room to stop receiving messages

**Payload:**
```json
{
  "roomId": "room-123"
}
```

**Response:**
```json
{
  "event": "leftRoom",
  "data": "room-123"
}
```

**Example Usage:**
```javascript
socket.emit('leaveRoom', { roomId: 'room-123' });
```

---

### Events You Receive (Server → Client)

Currently, the WebSocket is set up for room management. Message broadcasting would be implemented by the server sending events to rooms when new messages arrive.

**Expected future events:**
- `newMessage` - When a new message is sent to a room you're in
- `messageDeleted` - When a message is deleted
- `userTyping` - When someone is typing
- `userJoined` - When a user joins the room
- `userLeft` - When a user leaves the room

---

## Frontend Setup Guide

### Step 1: Install Required Packages

```bash
npm install axios socket.io-client
```

or

```bash
yarn add axios socket.io-client
```

---

### Step 2: Create API Service

Create a file: `src/services/chatApi.js`

```javascript
import axios from 'axios';

// Create axios instance with base configuration
const chatApi = axios.create({
  baseURL: 'http://your-api-domain.com', // Replace with your API URL
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication token to all requests
chatApi.interceptors.request.use(
  (config) => {
    // Get token from localStorage (or wherever you store it)
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
chatApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default chatApi;
```

---

### Step 3: Create Chat Functions

Create a file: `src/services/chatService.js`

```javascript
import chatApi from './chatApi';

/**
 * Create a new chat room
 * @param {Object} data - Room data
 * @param {string} data.name - Room name (optional for DIRECT)
 * @param {string[]} data.userIds - Array of user IDs to add
 * @param {string} data.type - "DIRECT" or "GROUP"
 * @returns {Promise<Object>} Created room
 */
export const createRoom = async (data) => {
  try {
    const response = await chatApi.post('/chat/rooms', data);
    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

/**
 * Get all chat rooms for current user
 * @returns {Promise<Array>} List of rooms
 */
export const getUserRooms = async () => {
  try {
    const response = await chatApi.get('/chat/rooms');
    return response.data;
  } catch (error) {
    console.error('Error getting rooms:', error);
    throw error;
  }
};

/**
 * Send a message to a room
 * @param {string} roomId - Room ID
 * @param {Object} data - Message data
 * @param {string} data.content - Message text
 * @param {string} data.replyToId - Optional message ID to reply to
 * @param {Object} files - Optional files
 * @param {File[]} files.images - Image files (max 5)
 * @param {File[]} files.videos - Video files (max 2)
 * @param {File[]} files.files - Document files (max 5)
 * @returns {Promise<Object>} Sent message
 */
export const sendMessage = async (roomId, data, files = {}) => {
  try {
    // Create FormData for multipart request
    const formData = new FormData();
    
    // Add text content
    formData.append('content', data.content);
    
    // Add replyToId if exists
    if (data.replyToId) {
      formData.append('replyToId', data.replyToId);
    }
    
    // Add images
    if (files.images && files.images.length > 0) {
      files.images.forEach((image) => {
        formData.append('images', image);
      });
    }
    
    // Add videos
    if (files.videos && files.videos.length > 0) {
      files.videos.forEach((video) => {
        formData.append('videos', video);
      });
    }
    
    // Add documents
    if (files.files && files.files.length > 0) {
      files.files.forEach((file) => {
        formData.append('files', file);
      });
    }
    
    const response = await chatApi.post(
      `/chat/rooms/${roomId}/messages`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get messages from a room
 * @param {string} roomId - Room ID
 * @returns {Promise<Array>} List of messages
 */
export const getMessages = async (roomId) => {
  try {
    const response = await chatApi.get(`/chat/rooms/${roomId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

/**
 * Add a member to a room
 * @param {string} roomId - Room ID
 * @param {string} userId - User ID to add
 * @returns {Promise<Object>} Added member info
 */
export const addMember = async (roomId, userId) => {
  try {
    const response = await chatApi.post(`/chat/rooms/${roomId}/members`, {
      userId,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

/**
 * Remove a member from a room
 * @param {string} roomId - Room ID
 * @param {string} userId - User ID to remove
 * @returns {Promise<Object>} Removal result
 */
export const removeMember = async (roomId, userId) => {
  try {
    const response = await chatApi.delete(
      `/chat/rooms/${roomId}/members/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
};
```

---

### Step 4: Create WebSocket Service

Create a file: `src/services/socketService.js`

```javascript
import { io } from 'socket.io-client';

let socket = null;

/**
 * Initialize WebSocket connection
 * @returns {Socket} Socket instance
 */
export const initializeSocket = () => {
  if (socket) {
    return socket;
  }
  
  const token = localStorage.getItem('authToken');
  
  socket = io('http://your-api-domain.com/chat', {
    transports: ['websocket'],
    auth: {
      token: token,
    },
  });
  
  // Connection events
  socket.on('connect', () => {
    console.log('✅ Connected to chat server');
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Disconnected from chat server');
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  return socket;
};

/**
 * Get current socket instance
 * @returns {Socket|null} Socket instance
 */
export const getSocket = () => {
  return socket;
};

/**
 * Join a chat room
 * @param {string} roomId - Room ID to join
 */
export const joinRoom = (roomId) => {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }
  
  socket.emit('joinRoom', { roomId });
  
  socket.once('joinedRoom', (data) => {
    console.log(`✅ Joined room: ${data}`);
  });
};

/**
 * Leave a chat room
 * @param {string} roomId - Room ID to leave
 */
export const leaveRoom = (roomId) => {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }
  
  socket.emit('leaveRoom', { roomId });
  
  socket.once('leftRoom', (data) => {
    console.log(`👋 Left room: ${data}`);
  });
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

---

## Complete Examples

### Example 1: Create a Direct Message Chat

```javascript
import { createRoom } from './services/chatService';

async function startDirectMessage(otherUserId) {
  try {
    const room = await createRoom({
      userIds: [otherUserId], // Just one user for DM
      type: 'DIRECT',
    });
    
    console.log('Direct message room created:', room);
    // room.id is the room ID you'll use for messaging
    
    return room;
  } catch (error) {
    console.error('Failed to create DM:', error);
    alert('Could not start conversation. Please try again.');
  }
}

// Usage
startDirectMessage('user-123');
```

---

### Example 2: Create a Group Chat

```javascript
import { createRoom } from './services/chatService';

async function createGroupChat(groupName, memberIds) {
  try {
    const room = await createRoom({
      name: groupName,
      userIds: memberIds, // Array of user IDs
      type: 'GROUP',
    });
    
    console.log('Group chat created:', room);
    return room;
  } catch (error) {
    console.error('Failed to create group:', error);
    alert('Could not create group. Please try again.');
  }
}

// Usage
createGroupChat('Weekend Trip', ['user-123', 'user-456', 'user-789']);
```

---

### Example 3: Send a Text Message

```javascript
import { sendMessage } from './services/chatService';

async function sendTextMessage(roomId, messageText) {
  try {
    const message = await sendMessage(roomId, {
      content: messageText,
    });
    
    console.log('Message sent:', message);
    return message;
  } catch (error) {
    console.error('Failed to send message:', error);
    alert('Could not send message. Please try again.');
  }
}

// Usage
sendTextMessage('room-123', 'Hello everyone!');
```

---

### Example 4: Send Message with Images

```javascript
import { sendMessage } from './services/chatService';

async function sendMessageWithImages(roomId, messageText, imageFiles) {
  try {
    // imageFiles should be an array of File objects from an input
    const message = await sendMessage(
      roomId,
      { content: messageText },
      { images: imageFiles }
    );
    
    console.log('Message with images sent:', message);
    return message;
  } catch (error) {
    console.error('Failed to send message:', error);
    alert('Could not send message. Please try again.');
  }
}

// Usage with file input
function handleImageUpload(roomId) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/jpeg';
  input.multiple = true;
  
  input.onchange = async (e) => {
    const files = Array.from(e.target.files);
    
    // Check file count
    if (files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    
    // Check file sizes
    const oversized = files.filter(f => f.size > 20 * 1024 * 1024);
    if (oversized.length > 0) {
      alert('Some files are larger than 20MB');
      return;
    }
    
    await sendMessageWithImages(roomId, 'Check out these photos!', files);
  };
  
  input.click();
}
```

---

### Example 5: Reply to a Message

```javascript
import { sendMessage } from './services/chatService';

async function replyToMessage(roomId, replyToMessageId, replyText) {
  try {
    const message = await sendMessage(roomId, {
      content: replyText,
      replyToId: replyToMessageId,
    });
    
    console.log('Reply sent:', message);
    return message;
  } catch (error) {
    console.error('Failed to send reply:', error);
    alert('Could not send reply. Please try again.');
  }
}

// Usage
replyToMessage('room-123', 'msg-456', 'I agree with that!');
```

---

### Example 6: Load and Display Messages

```javascript
import { getMessages } from './services/chatService';

async function loadMessages(roomId) {
  try {
    const messages = await getMessages(roomId);
    
    // Messages are sorted newest first, reverse for chat display
    const sortedMessages = messages.reverse();
    
    console.log(`Loaded ${sortedMessages.length} messages`);
    return sortedMessages;
  } catch (error) {
    console.error('Failed to load messages:', error);
    alert('Could not load messages. Please try again.');
  }
}

// Usage
async function displayMessages(roomId) {
  const messages = await loadMessages(roomId);
  
  // Display in your UI
  messages.forEach((msg) => {
    console.log(`${msg.userId}: ${msg.content}`);
  });
}
```

---

### Example 7: Complete React Component

```javascript
import React, { useState, useEffect } from 'react';
import { 
  getUserRooms, 
  getMessages, 
  sendMessage 
} from './services/chatService';
import { 
  initializeSocket, 
  joinRoom, 
  leaveRoom, 
  getSocket 
} from './services/socketService';

function ChatComponent() {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize socket on component mount
  useEffect(() => {
    initializeSocket();
    loadRooms();
    
    return () => {
      // Cleanup on unmount
      if (currentRoom) {
        leaveRoom(currentRoom.id);
      }
    };
  }, []);

  // Load all chat rooms
  const loadRooms = async () => {
    try {
      setLoading(true);
      const roomList = await getUserRooms();
      setRooms(roomList);
    } catch (error) {
      console.error('Error loading rooms:', error);
      alert('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  // Open a chat room
  const openRoom = async (room) => {
    try {
      // Leave previous room
      if (currentRoom) {
        leaveRoom(currentRoom.id);
      }

      // Set new room
      setCurrentRoom(room);

      // Join room via WebSocket
      joinRoom(room.id);

      // Load messages
      setLoading(true);
      const roomMessages = await getMessages(room.id);
      setMessages(roomMessages.reverse());
    } catch (error) {
      console.error('Error opening room:', error);
      alert('Failed to open chat');
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !currentRoom) {
      return;
    }

    try {
      const message = await sendMessage(currentRoom.id, {
        content: newMessage,
      });

      // Add message to local state
      setMessages((prev) => [...prev, message]);

      // Clear input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Room List Sidebar */}
      <div style={{ width: '300px', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
        <h2 style={{ padding: '20px' }}>Chats</h2>
        {loading && rooms.length === 0 ? (
          <p style={{ padding: '20px' }}>Loading...</p>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => openRoom(room)}
              style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                backgroundColor: currentRoom?.id === room.id ? '#f0f0f0' : 'white',
              }}
            >
              <strong>{room.name || 'Direct Message'}</strong>
              {room.messages[0] && (
                <p style={{ fontSize: '14px', color: '#666', margin: '5px 0 0 0' }}>
                  {room.messages[0].content}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentRoom ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
              <h2>{currentRoom.name || 'Direct Message'}</h2>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {loading ? (
                <p>Loading messages...</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} style={{ marginBottom: '15px' }}>
                    <strong>{msg.userId}</strong>
                    <p style={{ margin: '5px 0' }}>{msg.content}</p>
                    <small style={{ color: '#999' }}>
                      {new Date(msg.createdAt).toLocaleString()}
                    </small>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '20px',
                borderTop: '1px solid #ccc',
                display: 'flex',
                gap: '10px',
              }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatComponent;
```

---

### Example 8: Add Member to Group

```javascript
import { addMember } from './services/chatService';

async function addUserToGroup(roomId, userId) {
  try {
    const member = await addMember(roomId, userId);
    
    console.log('Member added:', member);
    alert(`${member.user.name} added to the group!`);
    
    return member;
  } catch (error) {
    console.error('Failed to add member:', error);
    
    if (error.response?.status === 403) {
      alert('Only admins can add members');
    } else if (error.response?.status === 400) {
      alert('User is already in the group');
    } else {
      alert('Could not add member. Please try again.');
    }
  }
}

// Usage
addUserToGroup('room-123', 'user-456');
```

---

### Example 9: Remove Member from Group

```javascript
import { removeMember } from './services/chatService';

async function removeUserFromGroup(roomId, userId) {
  try {
    const result = await removeMember(roomId, userId);
    
    console.log('Member removed:', result);
    alert('Member removed from group');
    
    return result;
  } catch (error) {
    console.error('Failed to remove member:', error);
    
    if (error.response?.status === 403) {
      alert('You do not have permission to remove this member');
    } else {
      alert('Could not remove member. Please try again.');
    }
  }
}

// Usage - Remove another user (requires admin)
removeUserFromGroup('room-123', 'user-456');

// Usage - Leave the group yourself
const currentUserId = 'current-user-id';
removeUserFromGroup('room-123', currentUserId);
```

---

### Example 10: File Upload with Preview

```javascript
import React, { useState } from 'react';
import { sendMessage } from './services/chatService';

function MessageInputWithFiles({ roomId }) {
  const [messageText, setMessageText] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    // Validate file count
    if (files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    // Validate file sizes
    const oversized = files.filter(f => f.size > 20 * 1024 * 1024);
    if (oversized.length > 0) {
      alert('Some files are larger than 20MB');
      return;
    }

    // Validate file types
    const invalidTypes = files.filter(
      f => !['image/png', 'image/jpeg'].includes(f.type)
    );
    if (invalidTypes.length > 0) {
      alert('Only PNG and JPEG images are allowed');
      return;
    }

    setSelectedImages(files);

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleRemoveImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setSelectedImages(newImages);
    setImagePreviews(newPreviews);

    // Clean up URL
    URL.revokeObjectURL(imagePreviews[index]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!messageText.trim() && selectedImages.length === 0) {
      alert('Please enter a message or select images');
      return;
    }

    try {
      await sendMessage(
        roomId,
        { content: messageText || 'Shared images' },
        { images: selectedImages }
      );

      // Clear form
      setMessageText('');
      setSelectedImages([]);
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImagePreviews([]);

      alert('Message sent!');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
      {/* Image Previews */}
      {imagePreviews.length > 0 && (
        <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {imagePreviews.map((preview, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  background: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Message Input */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />

        {/* Image Upload Button */}
        <label style={{ cursor: 'pointer' }}>
          <input
            type="file"
            accept="image/png,image/jpeg"
            multiple
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          <span style={{ padding: '10px', background: '#eee', borderRadius: '4px' }}>
            📎 Images
          </span>
        </label>

        {/* Send Button */}
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>

      <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
        Max 5 images, 20MB each. Supports PNG and JPEG only.
      </small>
    </form>
  );
}

export default MessageInputWithFiles;
```

---

## Quick Reference

### Summary of Limits

| Feature | Limit |
|---------|-------|
| Images per message | 5 files |
| Videos per message | 2 files |
| Documents per message | 5 files |
| File size | 20 MB per file |
| Allowed image formats | PNG, JPEG |
| Allowed video formats | MP4 |
| Messages returned per request | 20 (newest first) |
| Group chat members | 100 maximum |

---

### Common Error Codes

| Status Code | Meaning | Common Cause |
|-------------|---------|--------------|
| 400 | Bad Request | Invalid data format, missing required fields |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Room or resource doesn't exist |
| 413 | Payload Too Large | File size exceeds 20MB |
| 500 | Internal Server Error | Server-side issue |

---

## Tips for Beginners

1. **Always check authentication**: Make sure your JWT token is saved in localStorage and included in requests

2. **Handle errors gracefully**: Wrap API calls in try-catch blocks and show user-friendly error messages

3. **Validate files before upload**: Check file size and type on the frontend before sending to server

4. **Join rooms via WebSocket**: After opening a chat, use `joinRoom()` to receive real-time updates

5. **Clean up on component unmount**: Always leave rooms and disconnect socket when component unmounts

6. **Test with small files first**: Start with small images to ensure everything works before uploading large files

7. **Use loading states**: Show loading indicators while fetching data or sending messages

8. **Store room ID**: After creating a room, save the room ID - you'll need it for all message operations

---

## Need Help?

If you encounter issues:

1. Check the browser console for error messages
2. Verify your authentication token is valid
3. Ensure file sizes and formats meet requirements
4. Check network tab in browser dev tools to see request/response
5. Make sure WebSocket connection is established before joining rooms

---

**End of Documentation**
