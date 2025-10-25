# Guest Image Loading Fix

## Issue
Guest users could send images through chat, and images were being stored in the database, but they weren't appearing when messages were reloaded from the database.

## Root Cause
In `src/context/GlobalChatContext.tsx`, the `getMessagesByUserId` function was correctly receiving image data from the API but was not including the `image` field when mapping the guest messages.

## Fix Applied

### Before (Broken):
```typescript
const formattedMessages: Message[] = guestMessages.map((msg: { 
  _id: string; 
  senderId: string; 
  receiverId: string;
  text?: string; 
  createdAt: string;
}) => ({
  _id: msg._id,
  senderId: msg.senderId,
  receiverId: msg.receiverId,
  text: msg.text,
  createdAt: new Date(msg.createdAt),
  isOptimistic: false,
}));
```

### After (Fixed):
```typescript
const formattedMessages: Message[] = guestMessages.map((msg: { 
  _id: string; 
  senderId: string; 
  receiverId: string;
  text?: string; 
  image?: string; 
  createdAt: string;
}) => ({
  _id: msg._id,
  senderId: msg.senderId,
  receiverId: msg.receiverId,
  text: msg.text,
  image: msg.image, // Include image field
  createdAt: new Date(msg.createdAt),
  isOptimistic: false,
}));
```

## Verification

1. **API Response**: ✅ The `/api/messages/[userId]` endpoint correctly returns images for guest messages
2. **Message Interface**: ✅ The `Message` interface includes optional `image?: string` field
3. **Display Component**: ✅ `GlobalChatBox.tsx` properly renders images when present
4. **Storage**: ✅ Images are correctly stored in database and Cloudinary

## Result

✅ Guest users can now send images AND see them after page reload
✅ Images persist properly in chat history
✅ No breaking changes to existing functionality

## Testing Steps

1. Open app as guest user
2. Send a message with an image
3. Refresh the page or reload chat
4. Verify image appears in message history

The fix ensures complete parity between authenticated and guest user image messaging capabilities.