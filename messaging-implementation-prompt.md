# AI Implementation Prompt: Messages Section with WebSocket & RTK

## Project Overview
Build a complete, production-ready messaging system with real-time chat functionality, following mobile-first responsive design principles. Use WebSocket for real-time communication and Redux Toolkit (RTK) for state management.

---

## Core Requirements

### 1. Technology Stack
- **State Management**: Redux Toolkit (RTK) with RTK Query for API calls
- **Real-time Communication**: WebSocket (Socket.io client)
- **Styling**: Mobile-first responsive CSS (flexbox/grid)
- **File Handling**: multipart/form-data for media uploads
- **Authentication**: JWT tokens stored in localStorage

### 2. Backend Integration
**Base URL**: `http://your-api-domain.com`  
**WebSocket URL**: `ws://your-api-domain.com/chat`  
**Authentication**: All requests require `Authorization: Bearer YOUR_JWT_TOKEN` header

---

## Feature Requirements

### A. Chat List (Sidebar/Main View on Mobile)

#### Functionality:
1. **Display all user's chat rooms** (GET `/chat/rooms`)
   - Show both DIRECT and GROUP chats
   - Display last message preview
   - Show timestamp of last message
   - Highlight unread messages (if applicable)
   - Sort by most recent activity

2. **New Chat Button**
   - Search friends/users from your friends list
   - Select one user → Create DIRECT chat
   - Select multiple users → Create GROUP chat with name input
   - Create chat room (POST `/chat/rooms`)

---

### B. Chat Window (Main Content Area)

#### Functionality:

1. **Message Display** (GET `/chat/rooms/:roomId/messages`)
   - Load 20 messages initially
   - Implement infinite scroll (load more on scroll up)
   - Auto-scroll to bottom on new message
   - Group messages by date with date dividers
   - Show sender info (name, avatar) for group chats
   - Different alignment: your messages (right), others (left)

2. **Real-time Message Reception**
   - Connect to WebSocket on mount
   - Join room: emit `joinRoom` with `roomId`
   - Listen to `newMessage` event
   - Update RTK store with new messages
   - Show typing indicators (optional)

3. **Message Sending** (POST `/chat/rooms/:roomId/messages`)
   - Text input with auto-resize (max 5 lines)
   - Send on Enter, Shift+Enter for new line
   - Support media attachments:
     - Images (max 5, 20MB each, PNG/JPEG)
     - Videos (max 2, 20MB each, MP4)
     - Documents (max 5, 20MB each)
   - Show upload progress
   - Validate file types and sizes before upload
   - Display previews before sending
   - Emit message via WebSocket after successful POST

4. **Message Types**:
   Each message object should contain:
   - Unique message ID
   - Content text
   - User ID who sent it
   - Room ID it belongs to
   - Creation timestamp
   - User information (id, name, optional image)
   - Optional media array with type (IMAGE/VIDEO/DOCUMENT), URL, and publicId
   - Optional replyToId for threaded replies

---

### C. Message Input Component

#### Features:
1. **Text Input**
   - Auto-resize textarea (1-5 lines)
   - Character counter (optional)
   - Emoji picker (optional enhancement)
   - Mention autocomplete for group chats (optional)

2. **Attachment Controls**:
   - Image button that opens file picker (accept only PNG and JPEG)
   - Video button that opens file picker (accept only MP4)
   - Document button that opens file picker (generic files)
   - Show selected files with thumbnail previews
   - Allow removing individual files before sending

3. **Validation**:
   - Max 5 images, 2 videos, 5 documents per message
   - Max 20MB per file
   - Show error toast for validation failures
   - Disable send button while uploading

---

### D. WebSocket Integration

#### Setup:
Initialize Socket.io client connection to the WebSocket URL (ws://your-api-domain.com/chat) with authentication token from localStorage passed in the auth object. Use websocket transport for the connection.

#### Events to Implement:

**Emit (Send)**:
- Join a chat room: Emit 'joinRoom' event with roomId in the payload
- Leave a chat room: Emit 'leaveRoom' event with roomId in the payload
- Send typing indicator (optional): Emit 'typing' event with roomId and isTyping boolean

**Listen (Receive)**:
- New message received: Listen to 'newMessage' event, dispatch action to add message to store
- User joined room: Listen to 'userJoined' event (for groups), log user name who joined
- User left room: Listen to 'userLeft' event, log user name who left
- Typing indicator: Listen to 'userTyping' event, show "User is typing..." indicator
- Error handling: Listen to 'error' event, log errors to console

#### Lifecycle Management:
- On component mount: Connect the socket, disconnect on unmount
- On room change: When currentRoomId changes, emit joinRoom event. On cleanup, emit leaveRoom event for the previous room

---

### E. Redux Toolkit (RTK) State Management

#### Slice Structure:

**chatSlice Structure**:

Create a Redux slice named 'chat' with the following state:
- rooms: Array of all chat rooms
- currentRoomId: Currently selected room ID (or null)
- messages: Object mapping roomId to array of messages
- loading: Boolean for loading state
- error: String for error messages (or null)

Implement these reducers:
- setRooms: Replace entire rooms array
- setCurrentRoom: Update currentRoomId
- setMessages: Set messages for a specific room
- addMessage: Add a new message to a room's messages array, update the room's last message and updatedAt timestamp
- prependMessages: Add older messages to the beginning of a room's messages array (for infinite scroll)

#### RTK Query API:

**chatApi Setup**:
Create an API slice using createApi with the following configuration:
- Base URL: http://your-api-domain.com
- Prepare headers to include Authorization Bearer token from localStorage
- Tag types: 'Rooms' and 'Messages' for cache invalidation

**Endpoints to implement**:
1. getRooms query: Fetch all chat rooms from /chat/rooms endpoint, provides 'Rooms' tag
2. getMessages query: Fetch messages for a specific room from /chat/rooms/:roomId/messages with optional cursor parameter for pagination, provides 'Messages' tag with roomId
3. createRoom mutation: POST to /chat/rooms to create new room, invalidates 'Rooms' tag
4. sendMessage mutation: POST to /chat/rooms/:roomId/messages with formData, invalidates 'Messages' tag for that roomId

Export the generated hooks for use in components.

---

---

### G. Error Handling & Edge Cases

#### Handle:
1. **Load chat history on room selection**
   - Fetch last 20 messages
   - Store in RTK state
   - Persist across page refreshes using sessionStorage/localStorage

2. **Infinite Scroll**:
   Create a function to load more messages when user scrolls to top. Get the oldest message ID from current messages array, then fetch older messages using that ID as cursor. Add the fetched messages to the beginning of the messages array for that room.

3. **Cache Strategy**:
   - Use RTK Query cache (default 60 seconds)
   - Store room list in localStorage
   - On app load, check localStorage → fetch fresh data
   - WebSocket updates override cache

4. **Optimistic Updates**:
   - Add message to UI immediately
   - Show "sending..." indicator
   - Update with server ID on success
   - Rollback on error

---

### G. Error Handling & Edge Cases

#### Handle:
1. **Network Errors**:
   - Show toast notification
   - Retry mechanism with exponential backoff
   - Offline indicator when WebSocket disconnects

2. **File Upload Failures**:
   - Validate before upload
   - Show progress bar
   - Cancel upload option
   - Retry failed uploads

3. **Authentication Errors**:
   - Redirect to login on 401
   - Refresh token if expired

4. **Empty States**:
   - "No chats yet" when room list is empty
   - "Start a conversation" in empty chat window
   - "No messages" in a new room

5. **WebSocket Reconnection**:
   Handle disconnection by logging the event and attempting to reconnect. On successful reconnection, automatically rejoin the current room if one is selected.

---

## Implementation Checklist

### Phase 1: Setup & Basic Structure
- [ ] Setup RTK store with chatSlice and chatApi
- [ ] Create WebSocket service singleton
- [ ] Implement routing/navigation between views (if needed)

### Phase 2: Chat List Functionality
- [ ] Fetch and display all rooms
- [ ] Show last message preview
- [ ] Search friends for new chat
- [ ] Create DIRECT and GROUP rooms

### Phase 3: Messaging Core
- [ ] Fetch and display messages
- [ ] Send text messages
- [ ] Real-time message reception via WebSocket
- [ ] Auto-scroll to bottom on new messages

### Phase 4: Media & Attachments
- [ ] Image upload with validation
- [ ] Video upload with validation
- [ ] Document upload with validation
- [ ] File size and type validation
- [ ] Handle media in messages

### Phase 5: Advanced Features
- [ ] Infinite scroll (load older messages)
- [ ] Reply to message (optional)
- [ ] Typing indicators
- [ ] Read receipts (if backend supports)
- [ ] Message deletion/editing (if backend supports)

### Phase 6: Polish & Optimization
- [ ] Error handling & toast notifications
- [ ] Optimistic UI updates
- [ ] Persistence (localStorage/sessionStorage)
- [ ] Performance optimization (memo, virtualization if needed)

### Phase 7: Testing & Refinement
- [ ] Test with slow network
- [ ] Test offline behavior
- [ ] Test with large message history
- [ ] Test file upload edge cases

---

## Implementation Checklist

| Action | Method | Endpoint | WebSocket |
|--------|--------|----------|-----------|
| Get all chats | GET | `/chat/rooms` | - |
| Create chat | POST | `/chat/rooms` | - |
| Get messages | GET | `/chat/rooms/:id/messages` | - |
| Send message | POST | `/chat/rooms/:id/messages` | Emit after POST |
| Real-time receive | - | - | Listen `newMessage` |
| Join room | - | - | Emit `joinRoom` |
| Leave room | - | - | Emit `leaveRoom` |

---

## File Upload Flow

**Step-by-step process**:
1. User selects files from device
2. Validate files for type, size, and count limits
3. Show thumbnail previews to user
4. On send button click:
   - Create FormData object
   - Append 'content' field with message text
   - Append file arrays under 'images', 'videos', or 'files' keys
   - POST request to /chat/rooms/:id/messages endpoint
5. Display upload progress (optional)
6. On successful upload:
   - Clear input fields and previews
   - New message appears via WebSocket
7. On error:
   - Show error toast notification
   - Allow user to retry

---

## Performance Considerations

1. **Message Virtualization**: For rooms with 1000+ messages, use `react-window` or `react-virtuoso`
2. **Image Optimization**: Lazy load images, use thumbnails
3. **Debounce Typing Indicators**: Send typing events max once per 2 seconds
4. **Memoization**: Use React.memo for MessageBubble components
5. **Bundle Splitting**: Code split chat feature if part of larger app

---

## Accessibility

- [ ] Semantic HTML (nav, main, article for messages)
- [ ] ARIA labels for buttons (send, attach)
- [ ] Keyboard navigation (Tab, Enter to send)
- [ ] Screen reader announcements for new messages
- [ ] Focus management (focus input after sending)
- [ ] Color contrast ratios (4.5:1 minimum)

---

## Testing Scenarios

1. **Send/receive text message**
2. **Send message with image**
3. **Create new direct chat**
4. **Create new group chat**
5. **Load older messages**
6. **Refresh page - messages persist**
7. **Multiple tabs - sync state**
8. **Offline → Online transition**
9. **File validation errors**
10. **Switch between chats rapidly**

---

## Expected Behavior

✅ **DO**:
- Auto-scroll to bottom on new message
- Validate files before upload
- Show error notifications for failures
- Maintain scroll position when loading older messages
- Update room's last message instantly in state
- Handle timestamps appropriately

❌ **DON'T**:
- Lose scroll position on new message
- Show duplicate messages
- Allow sending empty messages
- Forget to leave WebSocket room on unmount
- Ignore authentication errors
- Let app crash on network failure

---

## Final Notes

This is a production-grade chat system. Pay special attention to:
- **Real-time sync**: WebSocket reliability and reconnection
- **State management**: Proper RTK patterns and cache invalidation
- **Error resilience**: Graceful degradation and error handling
- **Code quality**: Clean, maintainable, documented

Build iteratively, handle edge cases properly, and ensure the messaging experience is fast, reliable, and intuitive.

**Good luck! 🚀**
