/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import { ObjectId } from 'mongodb';

// Interface for user data consistency
interface User {
  _id?: ObjectId;
  firstName?: string;
  lastName?: string;
  name?: string; // For backward compatibility
  email?: string;
  bio?: string;
  profileImage?: string | null;
  picture?: string | null; // For backward compatibility
  publicIdProfile?: string | null;
  publicId?: string | null; // For backward compatibility
  isAdmin?: boolean;
  status?: boolean;
  designations?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const DB_NAME = 'CraftCode';
const COLLECTION = 'teams';

function normalizeDate(date: any): string {
  try {
    return new Date(date).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const slug = url.pathname.split('/').pop();

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const teamsCollection = db.collection(COLLECTION);
    const usersCollection = db.collection('users');

    // Find team member by slug
    const teamMember = await teamsCollection.findOne({ slug });

    if (!teamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Fetch user data to enrich team member information (similar to /teams API)
    const user = await usersCollection.findOne({ _id: new ObjectId(teamMember.userId) });

    if (!user) {
      return NextResponse.json({ error: 'Associated user not found' }, { status: 404 });
    }

    // Extract firstName and lastName from user data
    let firstName = '';
    let lastName = '';
    
    if (user.firstName && user.lastName) {
      firstName = user.firstName;
      lastName = user.lastName;
    } else if (user.name) {
      const nameParts = user.name.trim().split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    // Format the response similar to /teams API structure
    const formattedTeamMember = {
      ...teamMember,
      _id: teamMember._id.toString(),
      userId: teamMember.userId.toString(),
      slug: teamMember.slug,
      designation: teamMember.designation || '',
      // User data from users collection (matching /teams API structure)
      firstName: firstName || 'Unknown',
      lastName: lastName || 'User',
      email: user.email || 'N/A',
      bio: user.bio || 'No bio available.',
      profileImage: user.profileImage || user.picture || null,
      avatar: user.profileImage || user.picture || null,
      publicIdProfile: user.publicIdProfile || user.publicId || null,
      // Team-specific fields with proper array validation
      banner: teamMember.banner || null,
      publicIdBanner: teamMember.publicIdBanner || null,
      skills: Array.isArray(teamMember.skills) ? teamMember.skills : [],
      previousJobs: Array.isArray(teamMember.previousJobs) ? teamMember.previousJobs : [],
      projectLinks: Array.isArray(teamMember.projectLinks) ? teamMember.projectLinks : [],
      education: Array.isArray(teamMember.education) ? teamMember.education : [],
      certifications: Array.isArray(teamMember.certifications) ? teamMember.certifications : [],
      languages: Array.isArray(teamMember.languages) ? teamMember.languages : [],
      hobbies: Array.isArray(teamMember.hobbies) ? teamMember.hobbies : [],
      awards: Array.isArray(teamMember.awards) ? teamMember.awards : [],
      references: Array.isArray(teamMember.references) ? teamMember.references : [],
      supportiveEmail: teamMember.supportiveEmail || '',
      blogs: Array.isArray(teamMember.blogs) ? teamMember.blogs : [],
      projects: Array.isArray(teamMember.projects) ? teamMember.projects : [],
      createdAt: normalizeDate(teamMember.createdAt),
      updatedAt: normalizeDate(teamMember.updatedAt),
    };

    return NextResponse.json({ team: formattedTeamMember }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch team member error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch team member' }, { status: 500 });
  }
}