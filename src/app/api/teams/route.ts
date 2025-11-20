/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import { Db, ObjectId, WithId } from 'mongodb';

// Environment variables
const DB_NAME = process.env.DB_NAME || 'CraftCode';
const COLLECTION = process.env.COLLECTION_NAME || 'teams';

// Interfaces for data structures
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

interface Team {
  _id?: ObjectId;
  userId: string;
  banner?: string | null;
  publicIdBanner?: string | null;
  slug: string;
  skills?: string[];
  previousJobs?: PreviousJob[];
  projectLinks?: ProjectLink[];
  education?: Education[];
  certifications?: Certification[];
  languages?: Language[];
  hobbies?: string[];
  awards?: Award[];
  references?: Reference[];
  supportiveEmail: string;
  designation?: string;
  createdAt?: Date;
}

interface TeamsResponse {
  teams: (Omit<Team, '_id'> & {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    profileImage: string | null;
    publicIdProfile: string | null;
  })[];
  totalPages: number;
}

interface PostRequestBody {
  userId: string;
  // Team-specific fields
  banner?: string;
  publicIdBanner?: string;
  slug?: string;
  skills?: string[];
  previousJobs?: PreviousJob[];
  projectLinks?: ProjectLink[];
  education?: Education[];
  certifications?: Certification[];
  languages?: Language[];
  hobbies?: string[];
  awards?: Award[];
  references?: Reference[];
  supportiveEmail: string;
  designation?: string;
  // User-specific fields (to update users collection)
  firstName?: string;
  lastName?: string;
  bio?: string;
  profileImage?: string;
  publicIdProfile?: string;
  debug?: boolean;
}

// Utility function to generate a slug
const generateSlug = (firstName: string, lastName: string): string => {
  const baseSlug = `${firstName || ''} ${lastName || ''}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  return baseSlug || 'user'; // Fallback if both names are empty
};

// Utility function to ensure slug uniqueness
const ensureUniqueSlug = async (db: Db, baseSlug: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;
  while (await db.collection<Team>(COLLECTION).findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    const search = searchParams.get('search') || '';

    if (page < 1 || limit < 1) {
      return NextResponse.json({ error: 'Invalid page or limit parameters' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const teamsCollection = db.collection<Team>(COLLECTION);
    const usersCollection = db.collection<User>('users');

    // Build query for search (team-specific fields + user search via user lookup)
    const query: Partial<Team> & { $or?: any[] } = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');

      // First, find users that match the search criteria
      const matchingUsers = await usersCollection
        .find({
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex },
            { bio: searchRegex },
          ],
        })
        .project({ _id: 1 })
        .toArray();

      const matchingUserIds = matchingUsers.map((u) => u._id.toString());

      // Search both team-specific fields and matching user IDs
      query.$or = [
        { userId: { $in: matchingUserIds } }, // Users matching search
        { supportiveEmail: searchRegex },      // Team fields
        { slug: searchRegex },
        { designation: searchRegex },
        { skills: { $elemMatch: { $regex: searchRegex } } },
      ];
    }

    // Get total count for pagination
    const totalTeams = await teamsCollection.countDocuments(query);
    const totalPages = Math.ceil(totalTeams / limit);

    // Fetch team members with pagination
    const teams = await teamsCollection
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Fetch user data for each team member and combine with team data
    const formattedTeams = await Promise.all(
      teams.map(async (team: WithId<Team>) => {
        try {
          const user = await usersCollection.findOne({ _id: new ObjectId(team.userId) });
          
          // Extract firstName and lastName from user data
          let firstName = '';
          let lastName = '';
          
          if (user) {
            if (user.firstName && user.lastName) {
              firstName = user.firstName;
              lastName = user.lastName;
            } else if (user.name) {
              const nameParts = user.name.trim().split(' ');
              firstName = nameParts[0] || '';
              lastName = nameParts.slice(1).join(' ') || '';
            }
          }
          
          return {
            ...team,
            _id: team._id.toString(),
            userId: team.userId,
            slug: team.slug,
            designation: team.designation || '',
            // User data from users collection with fallbacks
            firstName: firstName || 'Unknown',
            lastName: lastName || 'User',
            email: user?.email || 'N/A',
            bio: user?.bio || 'No bio available.',
            profileImage: user?.profileImage || user?.picture || null,
            avatar: user?.profileImage || user?.picture || null,
            publicIdProfile: user?.publicIdProfile || user?.publicId || null,
            // Ensure all team arrays are properly initialized
            skills: Array.isArray(team.skills) ? team.skills : [],
            previousJobs: Array.isArray(team.previousJobs) ? team.previousJobs : [],
            projectLinks: Array.isArray(team.projectLinks) ? team.projectLinks : [],
            education: Array.isArray(team.education) ? team.education : [],
            certifications: Array.isArray(team.certifications) ? team.certifications : [],
            languages: Array.isArray(team.languages) ? team.languages : [],
            hobbies: Array.isArray(team.hobbies) ? team.hobbies : [],
            awards: Array.isArray(team.awards) ? team.awards : [],
            references: Array.isArray(team.references) ? team.references : [],
          };
        } catch (error) {
          console.error(`Error fetching user data for team member ${team.userId}:`, error);
          // Return team data with default user values if user fetch fails
          return {
            ...team,
            _id: team._id.toString(),
            userId: team.userId,
            slug: team.slug,
            designation: team.designation || '',
            firstName: 'Unknown',
            lastName: 'User',
            email: 'N/A',
            bio: 'No bio available.',
            profileImage: null,
            avatar: null,
            publicIdProfile: null,
            skills: Array.isArray(team.skills) ? team.skills : [],
            previousJobs: Array.isArray(team.previousJobs) ? team.previousJobs : [],
            projectLinks: Array.isArray(team.projectLinks) ? team.projectLinks : [],
            education: Array.isArray(team.education) ? team.education : [],
            certifications: Array.isArray(team.certifications) ? team.certifications : [],
            languages: Array.isArray(team.languages) ? team.languages : [],
            hobbies: Array.isArray(team.hobbies) ? team.hobbies : [],
            awards: Array.isArray(team.awards) ? team.awards : [],
            references: Array.isArray(team.references) ? team.references : [],
          };
        }
      })
    );

    return NextResponse.json<TeamsResponse>(
      {
        teams: formattedTeams,
        totalPages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: PostRequestBody = await req.json();
    const {
      userId,
      banner,
      publicIdBanner,
      slug: providedSlug,
      skills,
      previousJobs,
      projectLinks,
      education,
      certifications,
      languages,
      hobbies,
      awards: bodyAwards, // Renamed to avoid conflict with imported 'awards'
      references,
      supportiveEmail,
      designation,
      debug,
    } = body;

    // If debug is true, return the payload for inspection and skip DB logic
    if (debug && userId) {
      return NextResponse.json(
        {
          debug: true,
          received: body,
        },
        { status: 200 }
      );
    }

    // Validation for required fields
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Valid userId is required' }, { status: 400 });
    }
    
    // Validation for user fields (if provided)
    if (body.firstName && (typeof body.firstName !== 'string' || body.firstName.length < 1)) {
      return NextResponse.json({ error: 'First name must be a non-empty string' }, { status: 400 });
    }
    if (body.lastName && (typeof body.lastName !== 'string' || body.lastName.length < 1)) {
      return NextResponse.json({ error: 'Last name must be a non-empty string' }, { status: 400 });
    }
    if (body.bio && (typeof body.bio !== 'string' || body.bio.length > 500)) {
      return NextResponse.json({ error: 'Bio must be a string and less than 500 characters' }, { status: 400 });
    }
    if (body.profileImage && typeof body.profileImage !== 'string') {
      return NextResponse.json({ error: 'Profile image must be a string' }, { status: 400 });
    }
    if (banner && (typeof banner !== 'string' || banner.length > 1000)) {
      return NextResponse.json({ error: 'Banner URL must be a string and less than 1000 characters' }, { status: 400 });
    }
    if (publicIdBanner && (typeof publicIdBanner !== 'string' || publicIdBanner.length > 200)) {
      return NextResponse.json({ error: 'Public ID for banner must be a string and less than 200 characters' }, { status: 400 });
    }
    if (providedSlug && (typeof providedSlug !== 'string' || !/^[a-z0-9-]+$/.test(providedSlug) || providedSlug.length > 100)) {
      return NextResponse.json({ error: 'Slug must be a string, contain only lowercase letters, numbers, and hyphens, and be less than 100 characters' }, { status: 400 });
    }
    if (skills && (!Array.isArray(skills) || skills.some((s) => typeof s !== 'string' || s.length > 100))) {
      return NextResponse.json({ error: 'Skills must be an array of strings, each less than 100 characters' }, { status: 400 });
    }
    if (previousJobs && (!Array.isArray(previousJobs) || previousJobs.some((j) => typeof j.title !== 'string' || typeof j.company !== 'string' || typeof j.startDate !== 'string' || typeof j.endDate !== 'string' || typeof j.description !== 'string'))) {
      return NextResponse.json({ error: 'Previous jobs must be an array of objects with string title, company, startDate, endDate, and description' }, { status: 400 });
    }
    if (projectLinks && (!Array.isArray(projectLinks) || projectLinks.some((p) => typeof p.title !== 'string' || typeof p.url !== 'string' || typeof p.description !== 'string'))) {
      return NextResponse.json({ error: 'Project links must be an array of objects with string title, url, and description' }, { status: 400 });
    }
    if (education && (!Array.isArray(education) || education.some((e) => typeof e.degree !== 'string' || typeof e.institution !== 'string' || typeof e.startYear !== 'number' || typeof e.endYear !== 'number' || typeof e.description !== 'string'))) {
      return NextResponse.json({ error: 'Education must be an array of objects with string degree, institution, description, and number startYear, endYear' }, { status: 400 });
    }
    if (certifications && (!Array.isArray(certifications) || certifications.some((c) => typeof c.title !== 'string' || typeof c.issuer !== 'string' || typeof c.year !== 'number'))) {
      return NextResponse.json({ error: 'Certifications must be an array of objects with string title, issuer, and number year' }, { status: 400 });
    }
    if (languages && (!Array.isArray(languages) || languages.some((l) => typeof l.name !== 'string' || typeof l.proficiency !== 'string'))) {
      return NextResponse.json({ error: 'Languages must be an array of objects with string name and proficiency' }, { status: 400 });
    }
    if (hobbies && (!Array.isArray(hobbies) || hobbies.some((h) => typeof h !== 'string' || h.length > 100))) {
      return NextResponse.json({ error: 'Hobbies must be an array of strings, each less than 100 characters' }, { status: 400 });
    }
    if (bodyAwards && (!Array.isArray(bodyAwards) || bodyAwards.some((a) => typeof a.title !== 'string' || typeof a.issuer !== 'string' || typeof a.year !== 'number' || typeof a.description !== 'string'))) {
      return NextResponse.json({ error: 'Awards must be an array of objects with string title, issuer, description, and number year' }, { status: 400 });
    }
    if (references && (!Array.isArray(references) || references.some((r) => typeof r.name !== 'string' || typeof r.designation !== 'string' || typeof r.contact !== 'string'))) {
      return NextResponse.json({ error: 'References must be an array of objects with string name, designation, and contact' }, { status: 400 });
    }
    if (!supportiveEmail || !/^\S+@\S+\.\S+$/.test(supportiveEmail) || supportiveEmail.length > 100) {
      return NextResponse.json({ error: 'Valid supportive email is required and must be less than 100 characters' }, { status: 400 });
    }
    if (designation && (typeof designation !== 'string' || designation.length > 100)) {
      return NextResponse.json(
        { error: 'Designation must be a string and less than 100 characters' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const teamsCollection = db.collection<Team>(COLLECTION);

    // Check if supportiveEmail is unique
    const lowerEmail = supportiveEmail.toLowerCase();
    const existingEmail = await teamsCollection.findOne({ supportiveEmail: lowerEmail });
    if (existingEmail) {
      return NextResponse.json({ error: 'Supportive email already in use' }, { status: 400 });
    }

    // Check if user already has a team entry
    const existingTeam = await teamsCollection.findOne({ userId });
    if (existingTeam) {
      return NextResponse.json({ error: 'User already has a team profile' }, { status: 400 });
    }

    // Fetch existing user data
    const usersCollection = db.collection<User>('users');
    const existingUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user data if provided
    if (body.firstName || body.lastName || body.bio || body.profileImage || body.publicIdProfile) {
      try {
        const updateData: any = {
          updatedAt: new Date()
        };
        
        // Update firstName and lastName fields directly
        if (body.firstName !== undefined) updateData.firstName = body.firstName;
        if (body.lastName !== undefined) updateData.lastName = body.lastName;
        
        // Update name field for backward compatibility
        if (body.firstName !== undefined || body.lastName !== undefined) {
          const firstName = body.firstName || existingUser.firstName || '';
          const lastName = body.lastName || existingUser.lastName || '';
          updateData.name = `${firstName} ${lastName}`.trim();
        }
        
        if (body.bio !== undefined) updateData.bio = body.bio;
        if (body.profileImage !== undefined) {
          updateData.profileImage = body.profileImage;
          updateData.picture = body.profileImage; // For backward compatibility
        }
        if (body.publicIdProfile !== undefined) {
          updateData.publicIdProfile = body.publicIdProfile;
          updateData.publicId = body.publicIdProfile; // For backward compatibility
        }
        
        // Update user in database
        const userUpdateResult = await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: updateData }
        );
        
        if (userUpdateResult.matchedCount === 0) {
          return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 });
        }
      } catch (error) {
        console.error('Error updating user data:', error);
        return NextResponse.json({ error: 'Failed to update user information' }, { status: 500 });
      }
    }

    // Get updated user data for slug generation
    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    const firstName = updatedUser?.firstName || '';
    const lastName = updatedUser?.lastName || '';

    // Generate slug (use providedSlug if valid, otherwise generate from firstName and lastName)
    let slug = providedSlug || generateSlug(firstName, lastName);
    slug = await ensureUniqueSlug(db, slug);

    // Create team object
    const teamData: Team = {
      userId,
      banner: banner || null,
      publicIdBanner: publicIdBanner || null,
      slug,
      skills: skills || [],
      previousJobs: previousJobs || [],
      projectLinks: projectLinks || [],
      education: education || [],
      certifications: certifications || [],
      languages: languages || [],
      hobbies: hobbies || [],
      awards: bodyAwards || [],
      references: references || [],
      supportiveEmail: lowerEmail,
      designation: designation || '',
      createdAt: new Date(),
    };

    // Insert team data into database
    const result = await teamsCollection.insertOne(teamData);

    if (!result.insertedId) {
      return NextResponse.json({ error: 'Failed to create team profile' }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: 'Team profile created successfully', slug },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json({ error: 'Failed to create team profile' }, { status: 500 });
  }
}