'use client';

/**
 * Utility functions for meeting URL generation and navigation
 */

// Generate meeting room URL
export const getMeetingRoomUrl = (meetingId: string, params?: Record<string, string>) => {
  const baseUrl = `/meeting-area/${meetingId}`;
  
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }
  
  const searchParams = new URLSearchParams(params);
  return `${baseUrl}?${searchParams.toString()}`;
};

// Generate meeting link for sharing
export const getMeetingShareLink = (meetingId: string, params?: Record<string, string>) => {
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/meeting-area/${meetingId}`
    : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting-area/${meetingId}`;
    
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }
  
  const searchParams = new URLSearchParams(params);
  return `${baseUrl}?${searchParams.toString()}`;
};

// Generate personal room URL
export const getPersonalRoomUrl = (userId: string) => {
  return getMeetingRoomUrl(userId, { personal: 'true' });
};

// Generate personal room share link
export const getPersonalRoomShareLink = (userId: string) => {
  return getMeetingShareLink(userId, { personal: 'true' });
};

// Extract meeting ID from various URL formats
export const extractMeetingId = (url: string): string | null => {
  try {
    // Handle different URL formats
    const patterns = [
      /\/meeting-area\/([^/?]+)/,  // New format
      /\/meeting\/([^/?]+)/,       // Old format
      /meetingId[=:]([^&\s]+)/,    // Query parameter
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // If no pattern matches, try to extract from the end of the URL
    const urlParts = url.split('/').filter(Boolean);
    const lastPart = urlParts[urlParts.length - 1];
    
    // Check if it looks like a meeting ID (alphanumeric, possibly with hyphens)
    if (lastPart && /^[a-zA-Z0-9-_]+$/.test(lastPart.split('?')[0])) {
      return lastPart.split('?')[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting meeting ID:', error);
    return null;
  }
};

// Validate meeting ID format
export const isValidMeetingId = (meetingId: string): boolean => {
  if (!meetingId || typeof meetingId !== 'string') {
    return false;
  }
  
  // Basic validation - adjust pattern as needed based on your meeting ID format
  const pattern = /^[a-zA-Z0-9-_]{1,50}$/;
  return pattern.test(meetingId);
};

// Generate invitation message
export const generateInvitationMessage = (meetingId: string, meetingTitle?: string, hostName?: string) => {
  const meetingLink = getMeetingShareLink(meetingId);
  const title = meetingTitle || 'Meeting';
  const host = hostName ? ` hosted by ${hostName}` : '';
  
  return `You're invited to join "${title}"${host}. Click the link to join: ${meetingLink}`;
};

// Generate personal room invitation
export const generatePersonalRoomInvitation = (userId: string, hostName?: string) => {
  const roomLink = getPersonalRoomShareLink(userId);
  const host = hostName || 'the host';
  
  return `Join ${host}'s personal meeting room: ${roomLink}`;
};

const meetingUtils = {
  getMeetingRoomUrl,
  getMeetingShareLink,
  getPersonalRoomUrl,
  getPersonalRoomShareLink,
  extractMeetingId,
  isValidMeetingId,
  generateInvitationMessage,
  generatePersonalRoomInvitation,
};

export default meetingUtils;
