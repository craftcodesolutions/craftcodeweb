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
  isGuest?: boolean;
}

const ADMIN_EMAILS = [process.env.SUPPORT_EMAIL || 'support@craftcode.com'];

export async function getAllContacts(userId: string, includeAdmins: boolean = true): Promise<Contact[]> {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');

    let objectId;
    try {
      objectId = new ObjectId(userId);
    } catch (error) {
      console.error(`Invalid userId format: ${userId}`, error);
      throw new Error('Invalid user ID format');
    }

    const query = includeAdmins ? { _id: { $ne: objectId } } : { 
      _id: { $ne: objectId },
      email: { $nin: ADMIN_EMAILS }
    };

    const users = await usersCollection
      .find(query)
      .project({
        _id: 1,
        email: 1,
        firstName: 1,
        lastName: 1,
        profileImage: 1,
      })
      .toArray();

    const contacts: Contact[] = users.map(user => ({
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      isAdmin: ADMIN_EMAILS.includes(user.email.toLowerCase()),
    }));

    const supportEmail = process.env.SUPPORT_EMAIL || 'support@craftcode.com';
    const isCurrentUserAdmin = ADMIN_EMAILS.includes(
      (await usersCollection.findOne({ _id: objectId }))?.email?.toLowerCase() || ''
    );

    if (!isCurrentUserAdmin) {
      const targetUser = contacts.find(contact => contact.email.toLowerCase() === supportEmail.toLowerCase());
      if (!targetUser) {
        console.warn(`Support user ${supportEmail} not found in initial contacts fetch`);
        const userDoc = await usersCollection.findOne({ 
          email: { $regex: `^${supportEmail}$`, $options: 'i' } 
        });
        if (userDoc && userDoc._id.toString() !== userId) {
          console.log(`Found support user ${supportEmail} in database, adding to contacts`);
          contacts.push({
            _id: userDoc._id.toString(),
            email: userDoc.email,
            firstName: userDoc.firstName,
            lastName: userDoc.lastName,
            profileImage: userDoc.profileImage,
            isAdmin: true,
          });
        } else if (userDoc && userDoc._id.toString() === userId) {
          console.warn(`Support user ${supportEmail} is the current user, not adding to contacts`);
        } else {
          console.error(`Support user ${supportEmail} not found in database`);
        }
      } else {
        console.log(`Support user ${supportEmail} found in contacts`);
      }
    }

    return contacts.sort((a, b) => {
      if (a.email.toLowerCase() === supportEmail.toLowerCase()) return -1;
      if (b.email.toLowerCase() === supportEmail.toLowerCase()) return 1;
      return 0;
    });
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