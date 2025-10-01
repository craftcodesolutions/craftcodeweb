/* eslint-disable @typescript-eslint/no-explicit-any */

import clientPromise from "@/config/mongodb";
import { ObjectId } from "mongodb";

const DB_NAME = "CraftCode";
const MESSAGES_COLLECTION = "messages";
const USERS_COLLECTION = "users";

export async function getAllContacts(excludeUserId: string) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(USERS_COLLECTION);

    return await collection
      .find(
        { _id: { $ne: new ObjectId(excludeUserId) } } as any,
        { projection: { password: 0, resetToken: 0, resetTokenExpiry: 0 } }
      )
      .toArray();
  } catch (error) {
    console.error("Error in getAllContacts:", error);
    throw error;
  }
}

export async function getChatPartners(userId: string) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const messagesCollection = db.collection(MESSAGES_COLLECTION);
    const usersCollection = db.collection(USERS_COLLECTION);

    // Find all messages where the user is either sender or receiver
    const messages = await messagesCollection
      .find({
        $or: [
          { senderId: new ObjectId(userId) },
          { receiverId: new ObjectId(userId) }
        ]
      } as any)
      .toArray();

    // Extract unique chat partner IDs
    const chatPartnerIds = [
      ...new Set(
        messages.map((msg: any) =>
          msg.senderId.toString() === userId
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    // Get chat partners' user data (excluding sensitive fields)
    return await usersCollection
      .find(
        { _id: { $in: chatPartnerIds.map(id => new ObjectId(id)) } } as any,
        { projection: { password: 0, resetToken: 0, resetTokenExpiry: 0 } }
      )
      .toArray();
  } catch (error) {
    console.error("Error in getChatPartners:", error);
    throw error;
  }
}

export async function getMessagesByUserId(myId: string, otherUserId: string) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(MESSAGES_COLLECTION);

    return await collection
      .find({
        $or: [
          { senderId: new ObjectId(myId), receiverId: new ObjectId(otherUserId) },
          { senderId: new ObjectId(otherUserId), receiverId: new ObjectId(myId) }
        ]
      } as any)
      .sort({ createdAt: 1 }) // Sort by creation time (oldest first)
      .toArray();
  } catch (error) {
    console.error("Error in getMessagesByUserId:", error);
    throw error;
  }
}

export async function createMessage(messageData: {
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
}) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(MESSAGES_COLLECTION);

    // Create message object with timestamps
    const message = {
      senderId: new ObjectId(messageData.senderId),
      receiverId: new ObjectId(messageData.receiverId),
      text: messageData.text || undefined,
      image: messageData.image || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(message);
    return await collection.findOne({ _id: result.insertedId });
  } catch (error) {
    console.error("Error in createMessage:", error);
    throw error;
  }
}

export async function checkUserExists(userId: string): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(USERS_COLLECTION);

    const user = await collection.findOne({ _id: new ObjectId(userId) } as any);
    return !!user;
  } catch (error) {
    console.error("Error in checkUserExists:", error);
    return false;
  }
}
