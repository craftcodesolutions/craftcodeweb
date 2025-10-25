import { ObjectId } from 'mongodb';
import clientPromise from "@/config/mongodb";

const DB_NAME = process.env.DB_NAME || 'CraftCode';
const USERS_COLLECTION = 'users';

export interface Contact {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  isAdmin?: boolean;
}

interface GuestUser {
  guestId: string;
  dummyName?: string;
  expiresAt: Date;
}

interface UserContact {
  _id: ObjectId;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export interface GuestMessage {
  messageId: string;
  guestId: string;
  guestName: string;
  message: string;
  image?: string;
  chatId: string;
  timestamp: Date;
  type: 'guest_message' | 'support_reply';
}

export async function getGuestMessagesForAdmin(): Promise<GuestMessage[]> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection('guest_messages');

    // Get all guest messages, sorted by timestamp
    const messages = await collection
      .find<GuestMessage>({})
      .sort({ timestamp: -1 })
      .toArray();

    console.log(`📨 Retrieved ${messages.length} guest messages`);
    return messages;
  } catch (error) {
    console.error('Error fetching guest messages:', error);
    throw error;
  }
}

export async function getAllContacts(excludeUserId: string): Promise<Contact[]> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(USERS_COLLECTION);
    const guestCollection = db.collection('guest_users');

    // Get regular user contacts
    const userContacts = await usersCollection
      .find<UserContact>(
        { _id: { $ne: new ObjectId(excludeUserId) } },
        { projection: { password: 0, resetToken: 0, resetTokenExpiry: 0 } }
      )
      .toArray();

    // Get active guest contacts (not expired)
    const guestContacts = await guestCollection
      .find<GuestUser>({
        expiresAt: { $gt: new Date() }
      })
      .toArray();

    // Format user contacts
    const formattedUserContacts = userContacts.map(contact => ({
      ...contact,
      _id: contact._id.toString(),
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
      profileImage: contact.profileImage,
      isGuest: false
    }));

    // Format guest contacts
    const formattedGuestContacts = guestContacts.map(guest => ({
      _id: guest.guestId,
      email: `guest_${guest.guestId}@temp.com`,
      firstName: guest.dummyName || 'Guest',
      lastName: guest.guestId.substring(0, 6),
      profileImage: undefined,
      isGuest: true
    }));

    const allContacts = [...formattedUserContacts, ...formattedGuestContacts];
    console.log('Contacts fetched:', allContacts.map(c => ({ _id: c._id, email: c.email, isGuest: c.isGuest })));

    return allContacts;
  } catch (error) {
    console.error("Error in getAllContacts:", error);
    throw error;
  }
}