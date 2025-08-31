/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import { ObjectId } from 'mongodb';

const DB_NAME = 'CraftCode';
const COLLECTION = 'teams';

interface PreviousJob {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface ProjectLink {
  title: string;
  url: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  startYear: number;
  endYear: number;
  description: string;
}

interface Certification {
  title: string;
  issuer: string;
  year: number;
}

interface Language {
  name: string;
  proficiency: string;
}

interface Award {
  title: string;
  issuer: string;
  year: number;
  description: string;
}

interface Reference {
  name: string;
  designation: string;
  contact: string;
}

interface TeamMember {
  _id: string;
  userId: string;
  slug: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  profileImage?: string | null;
  publicIdProfile?: string | null;
  banner?: string | null;
  publicIdBanner?: string | null;
  skills: string[];
  previousJobs: PreviousJob[];
  projectLinks: ProjectLink[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  hobbies: string[];
  awards: Award[];
  references: Reference[];
  supportiveEmail?: string;
  blogs: any[];
  projects: any[];
  createdAt: string;
  updatedAt: string;
}

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
    const teamMembersCollection = db.collection(COLLECTION);

    const teamMember = await teamMembersCollection.findOne({ slug });

    if (!teamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Fetch user data to enrich team member information
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(teamMember.userId) });

    const formattedTeamMember: TeamMember = {
      _id: teamMember._id.toString(),
      userId: teamMember.userId.toString(),
      slug: teamMember.slug,
      firstName: user?.firstName || 'Unknown',
      lastName: user?.lastName || '',
      email: user?.email || 'N/A',
      bio: user?.bio || 'No bio available',
      profileImage: user?.profileImage || null,
      publicIdProfile: user?.publicIdProfile || null,
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