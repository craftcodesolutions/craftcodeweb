# Guest Image Upload Testing Guide

## What Was Implemented

✅ **Guest Image Upload Functionality** - Now fully functional!

### Changes Made:

1. **Fixed GlobalChatContext validation** (`src/context/GlobalChatContext.tsx`):
   - Removed restriction that prevented guest users from sending images
   - Updated validation to allow either text OR image (or both)
   - Fixed function calls to handle optional text parameter

2. **Updated Guest Messages API** (`src/app/api/guests/messages/route.ts`):
   - Added image parameter support in message creation
   - Updated validation to accept either message or image

### Existing Infrastructure (Already Working):

✅ **Image Upload API** (`/api/auth/cloudinary_support_image`):
   - Handles Cloudinary uploads with proper transformations
   - Supports 5MB max file size, PNG/JPEG formats
   - Stores images in `guest_chat_images` folder

✅ **Guest Message Storage** (`src/controllers/guestUserService.ts`):
   - GuestMessage interface already includes optional `image` field
   - Database schema supports image URLs

✅ **UI Components**:
   - `GlobalMessageInput.tsx` - Has image upload button and preview
   - `GlobalChatBox.tsx` - Displays images in message bubbles

## How to Test

### For Guest Users:

1. **Open the application as a guest**
2. **Start a chat session** (floating chat button)
3. **Click the image upload button** (camera/image icon)
4. **Select an image file** (PNG/JPEG, under 5MB)
5. **Send the message** (with or without text)

### Expected Behavior:

✅ Image preview appears before sending
✅ Image uploads to Cloudinary successfully  
✅ Message appears in chat with image
✅ Support staff can see the image in admin panel
✅ Images persist in database with proper URLs

## Technical Details

### Upload Flow:
1. User selects image → Creates base64 preview
2. Sends to `/api/messages/send/[userId]` with guestToken
3. Backend uploads to Cloudinary (`guest_chat_images` folder)
4. Saves message with Cloudinary URL to database
5. Real-time update via socket to support staff

### File Validation:
- **Client-side**: File type and preview generation
- **Server-side**: File type, size (5MB), Cloudinary security scanning

### Storage:
- **Images**: Cloudinary CDN with auto-optimization
- **Messages**: MongoDB with image URL reference
- **Real-time**: Socket.io for instant delivery

## Features Available:

✅ Drag & drop image upload (desktop)
✅ Click to browse files (all devices)
✅ Image preview before sending
✅ Image compression and optimization
✅ Remove image before sending
✅ Send image with or without text
✅ Real-time delivery to support
✅ Persistent storage
✅ Mobile responsive interface

## Authentication Levels:

### Guest Users:
✅ Can upload and send images via chat
❌ Cannot access support forms (require authentication)

### Authenticated Users:
✅ Can upload images via chat
✅ Can upload images via support forms (dashboard)
✅ Full access to all features

## Notes:

- Guest image uploads work through the **chat interface only**
- Support forms still require authentication
- All images are automatically optimized by Cloudinary
- Guest sessions expire after 24 hours
- Images remain accessible via permanent URLs