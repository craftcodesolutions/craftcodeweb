import clientPromise from "@/config/mongodb";

const DB_NAME = "CraftCode";
const COLLECTION = "guest_users";
const MESSAGES_COLLECTION = "guest_messages";

export interface GuestUser {
  guestId: string;
  dummyName: string;
  dummyEmail: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface GuestMessage {
  messageId: string;
  guestId: string;
  guestName: string;
  message: string;
  image?: string; // Optional image URL for uploaded images
  chatId: string;
  timestamp: Date;
  type: 'guest_message' | 'support_reply';
  senderId?: string; // ID of the sender (either guest ID or support team member ID)
}

export async function insertGuestUser(guestData: Omit<GuestUser, 'createdAt' | 'expiresAt'>) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<GuestUser>(COLLECTION);

  // Check if guest already exists
  const existingGuest = await collection.findOne({ guestId: guestData.guestId });
  if (existingGuest) {
    throw new Error("Guest with this ID already exists");
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours expiry

  const guest: GuestUser = {
    ...guestData,
    createdAt: now,
    expiresAt,
  };

  const result = await collection.insertOne(guest);
  return result;
}

export async function getGuestUserById(guestId: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<GuestUser>(COLLECTION);
  return await collection.findOne({ guestId });
}

export async function cleanupExpiredGuests() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<GuestUser>(COLLECTION);
  const now = new Date();
  const result = await collection.deleteMany({ expiresAt: { $lt: now } });
  return result.deletedCount;
}

export async function insertGuestMessage(messageData: Omit<GuestMessage, 'timestamp'>) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<GuestMessage>(MESSAGES_COLLECTION);

  const message: GuestMessage = {
    ...messageData,
    timestamp: new Date(),
  };

  const result = await collection.insertOne(message);
  return result;
}

export async function insertSupportReply(guestId: string, messageText: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<GuestMessage>(MESSAGES_COLLECTION);

  const supportReply: GuestMessage = {
    messageId: `support_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    guestId,
    guestName: 'Support Team',
    message: messageText,
    chatId: 'support_chat',
    timestamp: new Date(),
    type: 'support_reply',
  };

  const result = await collection.insertOne(supportReply);
  return result;
}

export async function getGuestMessages(guestId: string, limit: number = 50) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<GuestMessage>(MESSAGES_COLLECTION);
  
  return await collection
    .find({ 
      $or: [
        { guestId }, // Guest's own messages
        { guestId, type: 'support_reply' } // Support replies to this guest
      ]
    })
    .sort({ timestamp: 1 })
    .limit(limit)
    .toArray();
}
