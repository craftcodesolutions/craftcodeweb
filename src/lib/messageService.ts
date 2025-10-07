import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'CraftCode';

export interface Contact {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  isAdmin?: boolean;
}

export async function getAllContacts(userId: string): Promise<Contact[]> {
  const client = new MongoClient(MONGODB_URI);
  try {
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');

    // Validate userId as ObjectId
    let objectId;
    try {
      objectId = new ObjectId(userId);
    } catch (error) {
      console.error(`Invalid userId format: ${userId}`, error);
      throw new Error('Invalid user ID format');
    }

    // Fetch all users except the current user
    const users = await usersCollection
      .find({ _id: { $ne: objectId } })
      .project({
        _id: 1,
        email: 1,
        firstName: 1,
        lastName: 1,
        profileImage: 1,
        isAdmin: 1,
      })
      .toArray();

    // Map to Contact interface
    const contacts: Contact[] = users.map(user => ({
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      isAdmin: user.isAdmin || false,
    }));

    // Ensure the target user is included
    const targetEmail = 'somethinn999awkwardd@gmail.com';
    const targetUser = contacts.find(contact => contact.email.toLowerCase() === targetEmail.toLowerCase());
    if (!targetUser) {
      console.warn(`Target user ${targetEmail} not found in initial contacts fetch`);
      const userDoc = await usersCollection.findOne({ 
        email: { $regex: `^${targetEmail}$`, $options: 'i' } 
      });
      if (userDoc && userDoc._id.toString() !== userId) {
        console.log(`Found target user ${targetEmail} in database, adding to contacts`);
        contacts.push({
          _id: userDoc._id.toString(),
          email: userDoc.email,
          firstName: userDoc.firstName,
          lastName: userDoc.lastName,
          profileImage: userDoc.profileImage,
          isAdmin: userDoc.isAdmin || true, // Target user is typically admin
        });
      } else if (userDoc && userDoc._id.toString() === userId) {
        console.warn(`Target user ${targetEmail} is the current user, not adding to contacts`);
      } else {
        console.error(`Target user ${targetEmail} not found in database`);
      }
    } else {
      console.log(`Target user ${targetEmail} found in contacts`);
    }

    return contacts;
  } catch (error) {
    console.error('Error fetching contacts:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId,
    });
    throw new Error('Failed to fetch contacts');
  } finally {
    await client.close();
  }
}