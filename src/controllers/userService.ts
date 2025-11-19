/* eslint-disable @typescript-eslint/no-explicit-any */

import clientPromise from "@/config/mongodb";
import { User } from "@/types/User";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

const DB_NAME = "CraftCode";
const COLLECTION = "users";

export async function insertUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>) {
    try {
        console.log("Connecting to MongoDB...");
        const client = await clientPromise;
        console.log("MongoDB connected successfully");

        const db = client.db(DB_NAME);
        const collection = db.collection<User>(COLLECTION);

        // Check if user already exists
        console.log("Checking for existing user with email:", userData.email);
        const existingUser = await collection.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        // Hash the password
        console.log("Hashing password...");
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        // Create user object with timestamps
        const user: Omit<User, '_id'> = {
            ...userData,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        console.log("Inserting user into database...");
        const result = await collection.insertOne(user);
        console.log("User inserted successfully with ID:", result.insertedId);

        return result;
    } catch (error) {
        console.error("Error in insertUser function:", {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            error: error
        });
        throw error;
    }
}

export async function getAllUsers(): Promise<User[]> {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    return db.collection<User>(COLLECTION).find().toArray();
}

export async function getUserById(id: string) {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION);

        // Use 'any' to bypass type error for ObjectId in filter
        const user = await collection.findOne({ _id: new ObjectId(id) } as any);
        
        if (!user) {
            return null;
        }

        // Map database fields to expected frontend fields
        const nameParts = (user.name || '').split(' ');
        const mappedUser = {
            ...user,
            userId: user._id.toString(),
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            profileImage: user.picture || null,
            // Keep original fields for backward compatibility
            name: user.name,
            picture: user.picture
        };

        return mappedUser;
    } catch (error) {
        console.error("Error getting user by id:", error);
        throw error;
    }
}

// Update user with comprehensive validation
export async function updateUser(id: string, updateData: Partial<Omit<User, '_id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    try {
        console.log("updateUser called with id:", id, "type:", typeof id);
        
        // Validate ObjectId format
        if (!id || typeof id !== 'string' || id.length !== 24) {
            console.error("Invalid ObjectId format:", id);
            throw new Error("Invalid user ID format");
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection<User>(COLLECTION);

        // Check if user exists
        const existingUser = await collection.findOne({ _id: new ObjectId(id) } as any);
        if (!existingUser) {
            console.error("User not found with id:", id);
            throw new Error("User not found");
        }

        console.log("Found existing user:", existingUser.email);

        // If email is being updated, check if it's already taken by another user
        if (updateData.email && updateData.email !== existingUser.email) {
            const emailExists = await collection.findOne({
                email: updateData.email,
                _id: { $ne: new ObjectId(id) }
            } as any);
            if (emailExists) {
                throw new Error("Email already exists");
            }
        }

        // Hash password if it's being updated
        let hashedPassword = existingUser.password;
        if (updateData.password) {
            const saltRounds = 12;
            hashedPassword = await bcrypt.hash(updateData.password, saltRounds);
        }

        // Prepare update object
        const updateObject: any = {
            ...updateData,
            password: hashedPassword,
            updatedAt: new Date()
        };

        // Remove undefined fields
        Object.keys(updateObject).forEach(key => {
            if (updateObject[key] === undefined) {
                delete updateObject[key];
            }
        });

        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) } as any,
            { $set: updateObject },
            { returnDocument: 'after' }
        );

        return result;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
}

// Update user admin status specifically
export async function updateUserAdminStatus(id: string, isAdmin: boolean): Promise<User | null> {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection<User>(COLLECTION);

        // Check if user exists
        const existingUser = await collection.findOne({ _id: new ObjectId(id) } as any);
        if (!existingUser) {
            throw new Error("User not found");
        }

        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) } as any,
            {
                $set: {
                    isAdmin,
                    updatedAt: new Date()
                }
            },
            { returnDocument: 'after' }
        );

        return result;
    } catch (error) {
        console.error("Error updating user admin status:", error);
        throw error;
    }
}

// Update user profile (name, email, image)
export async function updateUserProfile(id: string, profileData: { firstName?: string; lastName?: string; email?: string; profileImage?: string; bio?: string; publicId?: string; isAdmin?: boolean; status?: boolean; designations?: string[] }): Promise<User | null> {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection<User>(COLLECTION);

        // Check if user exists
        const existingUser = await collection.findOne({ _id: new ObjectId(id) } as any);
        if (!existingUser) {
            throw new Error("User not found");
        }

        // If email is being updated, check if it's already taken by another user
        if (profileData.email && profileData.email !== existingUser.email) {
            const emailExists = await collection.findOne({
                email: profileData.email,
                _id: { $ne: new ObjectId(id) }
            } as any);
            if (emailExists) {
                throw new Error("Email already exists");
            }
        }

        // Prepare update object with field conversion
        const updateObject: any = {
            updatedAt: new Date()
        };

        // Convert firstName + lastName to name field (for compatibility with existing storage)
        if (profileData.firstName !== undefined || profileData.lastName !== undefined) {
            const firstName = profileData.firstName || '';
            const lastName = profileData.lastName || '';
            updateObject.name = `${firstName} ${lastName}`.trim();
        }

        // Convert profileImage to picture field (for compatibility with existing storage)
        if (profileData.profileImage !== undefined) {
            updateObject.picture = profileData.profileImage;
        }

        // Add other fields directly
        if (profileData.email !== undefined) updateObject.email = profileData.email;
        if (profileData.bio !== undefined) updateObject.bio = profileData.bio;
        if (profileData.publicId !== undefined) updateObject.publicId = profileData.publicId;
        if (profileData.isAdmin !== undefined) updateObject.isAdmin = profileData.isAdmin;
        if (profileData.status !== undefined) updateObject.status = profileData.status;
        if (profileData.designations !== undefined) updateObject.designations = profileData.designations;

        // Remove undefined fields
        Object.keys(updateObject).forEach(key => {
            if (updateObject[key] === undefined) {
                delete updateObject[key];
            }
        });

        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) } as any,
            { $set: updateObject },
            { returnDocument: 'after' }
        );

        return result;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
}

// Update user password
export async function updateUserPassword(id: string, newPassword: string): Promise<void> {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection<User>(COLLECTION);

        // Check if user exists
        const existingUser = await collection.findOne({ _id: new ObjectId(id) } as any);
        if (!existingUser) {
            throw new Error("User not found");
        }

        // Hash the new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await collection.updateOne(
            { _id: new ObjectId(id) } as any,
            {
                $set: {
                    password: hashedPassword,
                    updatedAt: new Date()
                }
            }
        );
    } catch (error) {
        console.error("Error updating user password:", error);
        throw error;
    }
}

// Delete user
export async function deleteUser(id: string): Promise<void> {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection<User>(COLLECTION);

        // Check if user exists
        const existingUser = await collection.findOne({ _id: new ObjectId(id) } as any);
        if (!existingUser) {
            throw new Error("User not found");
        }

        await collection.deleteOne({ _id: new ObjectId(id) } as any);
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
}    