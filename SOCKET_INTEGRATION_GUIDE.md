# Socket.IO Integration Guide

## Overview

This document provides a comprehensive guide to the Socket.IO integration in the CraftCode application. The system provides real-time communication capabilities across authentication, messaging, and notification features.

## Architecture

### Dual Socket System

The application uses a dual socket architecture:

1. **Main Server** (`/lib/socketServer.ts`): Room-based messaging with `user_${userId}` rooms
2. **Namespace Server** (`/pages/api/socket.ts`): Backward compatibility with `/auth`, `/messenger`, `/notifications` namespaces

### Connection Paths

- **Main Server**: `/api/socket`
- **Namespace Server**: `/api/socket-namespaces`

## API Integration

### Authentication APIs

All authentication endpoints have been enhanced with Socket.IO integration:

#### `/api/auth/login`
- ✅ Socket availability check after successful login
- ✅ Enhanced response with `socketReady: true` flag
- ✅ Complete user data for immediate socket authentication

#### `/api/auth/google/callback`
- ✅ Socket availability check for OAuth users
- ✅ Redirect with `socket=connect` parameter
- ✅ Session management integration

#### `/api/auth/github/callback`
- ✅ Socket availability check for OAuth users
- ✅ Redirect with `socket=connect` parameter
- ✅ Session management integration

#### `/api/auth/logout`
- ✅ Force disconnect all user's socket connections
- ✅ Session cleanup in database
- ✅ Graceful error handling

### User Management API

#### `/api/users`
- ✅ Socket integration checks during user creation
- ✅ Real-time token updates via `emitTokenUpdate()`
- ✅ User status changes via `emitUserStatusChange()`

### Messaging API

#### `/api/messages/send/[userId]`
- ✅ Real-time message broadcasting
- ✅ Multi-device synchronization
- ✅ Fallback to database-only if socket unavailable

## Client-Side Integration

### AuthContext Updates

The `AuthContext` has been updated to work with the main socket server:

```typescript
// Connect to main server instead of namespaces
const socket = io(BASE_URL, {
  path: '/api/socket',
  auth: { token: token() },
  // ... other options
});

// Authenticate after connection
socket.on('connect', () => {
  socket.emit('authenticate', { token: token() });
});
```

### Socket Event Handlers

#### Authentication Events
- `authenticated`: Successful authentication confirmation
- `authError`: Authentication failure
- `tokenUpdated`: Admin updated user data - refresh token
- `userStatusChanged`: Account activation/deactivation

#### Messaging Events
- `newMessage`: Incoming message from another user
- `messageSent`: Confirmation of sent message (multi-device sync)
- `userTyping`: Typing indicator from other users
- `getOnlineUsers`: Updated list of online users

#### System Events
- `ping`/`pong`: Connection health checks
- `force_logout`: Admin-initiated logout
- `server_shutdown`: Graceful server shutdown notification

## Real-time Features

### Token Updates
When an admin updates a user's status or admin privileges:
1. Database is updated with new user data
2. New JWT tokens are generated for all user sessions
3. `emitTokenUpdate()` broadcasts new token to all user's devices
4. Client receives token and updates automatically
5. User stays logged in with updated permissions

### Session Management
- Multi-device session tracking
- Real-time session synchronization
- Force logout capabilities
- Device-specific session management

### Online Status
- Real-time online/offline status tracking
- Connection counting per user
- Broadcast online user lists
- Multi-device connection handling

## Testing and Monitoring

### Socket Test API

#### `GET /api/socket-test`
Comprehensive socket system testing:
- Socket server availability
- Connection tracking
- Message sending capabilities
- Broadcast functionality
- API integration checks

#### `POST /api/socket-test`
Manual socket actions:
```json
{
  "action": "sendToUser|broadcast|emitOnlineUsers",
  "targetUserId": "optional_user_id",
  "message": "test_message"
}
```

### Socket Monitor Component

The `SocketMonitor` component provides:
- Real-time connection status display
- Online users visualization
- Test action buttons
- Detailed test results
- Error reporting

Usage:
```tsx
import SocketMonitor from '@/components/SocketMonitor';

function AdminDashboard() {
  return (
    <div>
      <SocketMonitor />
      {/* Other dashboard content */}
    </div>
  );
}
```

## Configuration

### Environment Variables

Required environment variables:
```env
JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### CORS Configuration

Socket.IO CORS is configured to allow:
- Development: `http://localhost:3000`, `http://127.0.0.1:3000`
- Production: `process.env.NEXT_PUBLIC_APP_URL`

## Security

### Authentication
- JWT token verification for all socket connections
- User-specific room isolation (`user_${userId}`)
- Automatic disconnection for invalid tokens

### Authorization
- Room-based message targeting
- Admin-only functions for user management
- Session-based access control

### Data Protection
- Encrypted JWT tokens
- Secure cookie handling
- IP and user agent tracking for sessions

## Troubleshooting

### Common Issues

1. **Socket not connecting**
   - Check if `/api/socket` endpoint is accessible
   - Verify JWT token is valid
   - Check browser console for connection errors

2. **Messages not real-time**
   - Verify socket connection status
   - Check if `getSocketIO()` returns valid instance
   - Review server logs for socket initialization

3. **Token updates not working**
   - Ensure user is connected to socket
   - Check if `emitTokenUpdate()` is being called
   - Verify client is listening for `tokenUpdated` event

### Debug Commands

```javascript
// Check socket connection status
console.log('Auth Socket:', authSocket?.connected);
console.log('Messenger Socket:', messengerSocket?.connected);

// Test socket functionality
fetch('/api/socket-test').then(r => r.json()).then(console.log);

// Check online users
console.log('Online Users:', onlineUsers);
```

### Logging

The system provides comprehensive logging:
- `✅` Success operations
- `⚠️` Warnings and fallbacks  
- `❌` Errors and failures
- `🔌` Connection events
- `📨` Message broadcasting
- `🧪` Test operations

## Performance Considerations

### Connection Management
- Efficient user connection tracking with Maps
- O(1) user lookups
- Proper cleanup on disconnection
- Memory leak prevention

### Message Broadcasting
- Targeted room-based messaging
- Avoid unnecessary broadcasts
- Optimistic UI updates
- Fallback to database storage

### Scaling
- Ready for Redis adapter integration
- Horizontal scaling support
- Load balancer compatible
- Session persistence across servers

## Future Enhancements

### Planned Features
- Message read receipts
- File sharing with real-time progress
- Group chat rooms
- Video call notifications
- Push notification integration

### Optimization Opportunities
- Redis integration for multi-server setup
- Message queuing for offline users
- Connection pooling optimization
- Advanced rate limiting

## Support

For issues or questions regarding the Socket.IO integration:
1. Check this documentation
2. Review server logs for error messages
3. Use the Socket Monitor component for diagnostics
4. Run the Socket Test API for system verification

## Version History

- **v1.0**: Initial Socket.IO integration with authentication APIs
- **v1.1**: Added messaging real-time capabilities
- **v1.2**: Enhanced session management and multi-device support
- **v1.3**: Added comprehensive testing and monitoring tools
