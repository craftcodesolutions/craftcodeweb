import clientPromise from "@/config/mongodb";
import { ObjectId, WithId, Document } from "mongodb";

const DB_NAME = "CraftCode";
const MESSAGES_COLLECTION = "messages";
const USERS_COLLECTION = "users";

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export async function getAllContacts(excludeUserId: string): Promise<Contact[]> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(USERS_COLLECTION);

    const contacts = await collection
      .find(
        { _id: { $ne: new ObjectId(excludeUserId) } },
        { projection: { password: 0, resetToken: 0, resetTokenExpiry: 0 } }
      )
      .toArray();

    console.log('Contacts fetched:', contacts.map(c => ({ _id: c._id.toString(), email: c.email })));

    return contacts.map(contact => ({
      ...contact,
      _id: contact._id.toString(),
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
      profileImage: contact.profileImage,
    }));
  } catch (error) {
    console.error("Error in getAllContacts:", error);
    throw error;
  }
}

export async function getChatPartners(userId: string): Promise<Contact[]> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const messagesCollection = db.collection(MESSAGES_COLLECTION);
    const usersCollection = db.collection(USERS_COLLECTION);

    const messages = await messagesCollection
      .find({
        $or: [
          { senderId: new ObjectId(userId) },
          { receiverId: new ObjectId(userId) }
        ]
      })
      .toArray() as Array<WithId<Document> & { senderId: ObjectId; receiverId: ObjectId }>;

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) => {
          const sender = msg.senderId.toString();
          const receiver = msg.receiverId.toString();
          return sender === userId ? receiver : sender;
        })
      ),
    ];

    return await usersCollection
      .find(
        { _id: { $in: chatPartnerIds.map(id => new ObjectId(id)) } },
        { projection: { password: 0, resetToken: 0, resetTokenExpiry: 0 } }
      )
      .toArray()
      .then(partners => partners.map(partner => ({
        ...partner,
        _id: partner._id.toString(),
        email: partner.email,
        firstName: partner.firstName,
        lastName: partner.lastName,
        profileImage: partner.profileImage,
      })));
  } catch (error) {
    console.error("Error in getChatPartners:", error);
    throw error;
  }
}

export async function getMessagesByUserId(myId: string, otherUserId: string): Promise<Message[]> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(MESSAGES_COLLECTION);

    const messages = await collection
      .find({
        $or: [
          { senderId: new ObjectId(myId), receiverId: new ObjectId(otherUserId) },
          { senderId: new ObjectId(otherUserId), receiverId: new ObjectId(myId) }
        ]
      })
      .sort({ createdAt: 1 })
      .toArray();

    // Deduplicate messages by _id
    const msgs = messages as Array<WithId<Document> & { _id: ObjectId; senderId: ObjectId; receiverId: ObjectId; text?: string; image?: string; createdAt: Date; updatedAt: Date }>;
    const uniqueMessages = Array.from(
      new Map(msgs.map((msg) => [msg._id.toString(), msg])).values()
    );

    return uniqueMessages.map((msg) => ({
      _id: msg._id.toString(),
      senderId: msg.senderId.toString(),
      receiverId: msg.receiverId.toString(),
      text: msg.text,
      image: msg.image,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }));
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
}): Promise<Message> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(MESSAGES_COLLECTION);

    const existingMessage = await collection.findOne({
      senderId: new ObjectId(messageData.senderId),
      receiverId: new ObjectId(messageData.receiverId),
      text: messageData.text || undefined,
      image: messageData.image || undefined,
      createdAt: { $gte: new Date(Date.now() - 5000) },
    });

    if (existingMessage) {
      console.warn('Duplicate message detected in createMessage:', {
        messageId: existingMessage._id.toString(),
        text: messageData.text?.substring(0, 50),
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
      });
      return {
        ...existingMessage,
        _id: existingMessage._id.toString(),
        senderId: existingMessage.senderId.toString(),
        receiverId: existingMessage.receiverId.toString(),
        createdAt: existingMessage.createdAt,
        updatedAt: existingMessage.updatedAt,
      };
    }

    const message = {
      senderId: new ObjectId(messageData.senderId),
      receiverId: new ObjectId(messageData.receiverId),
      text: messageData.text || undefined,
      image: messageData.image || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(message);
    const savedMessage = await collection.findOne({ _id: result.insertedId });
    if (!savedMessage) {
      throw new Error('Failed to retrieve saved message');
    }
    return {
      ...savedMessage,
      _id: savedMessage._id.toString(),
      senderId: savedMessage.senderId.toString(),
      receiverId: savedMessage.receiverId.toString(),
      createdAt: savedMessage.createdAt,
      updatedAt: savedMessage.updatedAt,
    };
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

    const user = await collection.findOne({ _id: new ObjectId(userId) });
    return !!user;
  } catch (error) {
    console.error("Error in checkUserExists:", error);
    return false;
  }
}