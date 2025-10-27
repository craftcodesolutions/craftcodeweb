/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';

const DB_NAME = 'CraftCode';
const USERS_COLLECTION = 'users';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const usersCollection = db.collection(USERS_COLLECTION);

        const users = await usersCollection
            .find(
                {},
                {
                    projection: {
                        password: 0,
                        resetToken: 0,
                        resetTokenExpiry: 0,
                    },
                }
            )
            .toArray();

        const formattedUsers = users.map((user: any) => {
            const fallbackName = user.email || 'Unknown';
            const firstName = typeof user.firstName === 'string' ? user.firstName : '';
            const lastName = typeof user.lastName === 'string' ? user.lastName : '';
            const name =
                (firstName || lastName
                    ? `${firstName} ${lastName}`.trim()
                    : typeof user.name === 'string'
                    ? user.name
                    : '') || fallbackName;

            return {
                id: user._id.toString(),
                name,
                email: user.email || null,
                firstName: firstName || null,
                lastName: lastName || null,
                isAdmin: Boolean(user.isAdmin),
                status: typeof user.status === 'boolean' ? user.status : true,
                picture: user.picture || null,
            };
        });

        const admins = formattedUsers.filter((user) => user.isAdmin);

        return NextResponse.json(
            {
                admins,
                clients: formattedUsers,
                totalUsers: formattedUsers.length,
                totalAdmins: admins.length,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Failed to fetch project users', error);
        return NextResponse.json({ error: 'Failed to fetch project users' }, { status: 500 });
    }
}

