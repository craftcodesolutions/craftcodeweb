/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import { ObjectId } from 'mongodb';

// Environment variables
const DB_NAME = process.env.DB_NAME || 'CraftCode';
const COLLECTION = process.env.COLLECTION_NAME || 'teams';

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
const ensureUniqueSlug = async (db: any, baseSlug: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;
  while (await db.collection(COLLECTION).findOne({ slug })) {
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
    const teamsCollection = db.collection(COLLECTION);
    const usersCollection = db.collection('users');

    // Build query for search
    const query: any = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');

      // Search users by name, email, bio
      const matchingUsers = await usersCollection.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { bio: searchRegex },
        ]
      }).project({ userId: 1 }).toArray();

      const matchingUserIds = matchingUsers.map((u: any) => u.userId);

      // Search teams by userId (from users), supportiveEmail, slug, designation
      query.$or = [
        { userId: { $in: matchingUserIds } },
        { supportiveEmail: searchRegex },
        { slug: searchRegex },
        { designation: searchRegex },
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

    // Enrich team data with user data
    const formattedTeams = await Promise.all(
      teams.map(async (team: any) => {
        const user = await usersCollection.findOne({ userId: team.userId });
        return {
          ...team,
          _id: team._id.toString(),
          slug: team.slug, // Include slug
          designation: team.designation || '', // Include designation
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          bio: user?.bio || '',
          profileImage: user?.profileImage || null,
          publicIdProfile: user?.publicIdProfile || null,
        };
      })
    );

    return NextResponse.json(
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
    const {
      userId,
      banner,
      publicIdBanner,
      slug: providedSlug, // Allow optional slug in request
      skills,
      previousJobs,
      projectLinks,
      education,
      certifications,
      languages,
      hobbies,
      awards,
      references,
      supportiveEmail,
      designation, // Added designation field
      debug,
    } = await req.json();

    // If debug is true, return the payload for inspection and skip DB logic
    if (debug && userId) {
      return NextResponse.json(
        {
          debug: true,
          received: {
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
            awards,
            references,
            supportiveEmail,
            designation, // Include designation in debug response
          },
        },
        { status: 200 }
      );
    }

    // Validation for team-specific fields
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Valid userId is required' }, { status: 400 });
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
    if (skills && (!Array.isArray(skills) || skills.some((s: any) => typeof s !== 'string' || s.length > 100))) {
      return NextResponse.json({ error: 'Skills must be an array of strings, each less than 100 characters' }, { status: 400 });
    }
    if (previousJobs && (!Array.isArray(previousJobs) || previousJobs.some((j: any) => typeof j.title !== 'string' || typeof j.company !== 'string' || typeof j.startDate !== 'string' || typeof j.endDate !== 'string' || typeof j.description !== 'string'))) {
      return NextResponse.json({ error: 'Previous jobs must be an array of objects with string title, company, startDate, endDate, and description' }, { status: 400 });
    }
    if (projectLinks && (!Array.isArray(projectLinks) || projectLinks.some((p: any) => typeof p.title !== 'string' || typeof p.url !== 'string' || typeof p.description !== 'string'))) {
      return NextResponse.json({ error: 'Project links must be an array of objects with string title, url, and description' }, { status: 400 });
    }
    if (education && (!Array.isArray(education) || education.some((e: any) => typeof e.degree !== 'string' || typeof e.institution !== 'string' || typeof e.startYear !== 'number' || typeof e.endYear !== 'number' || typeof e.description !== 'string'))) {
      return NextResponse.json({ error: 'Education must be an array of objects with string degree, institution, description, and number startYear, endYear' }, { status: 400 });
    }
    if (certifications && (!Array.isArray(certifications) || certifications.some((c: any) => typeof c.title !== 'string' || typeof c.issuer !== 'string' || typeof c.year !== 'number'))) {
      return NextResponse.json({ error: 'Certifications must be an array of objects with string title, issuer, and number year' }, { status: 400 });
    }
    if (languages && (!Array.isArray(languages) || languages.some((l: any) => typeof l.name !== 'string' || typeof l.proficiency !== 'string'))) {
      return NextResponse.json({ error: 'Languages must be an array of objects with string name and proficiency' }, { status: 400 });
    }
    if (hobbies && (!Array.isArray(hobbies) || hobbies.some((h: any) => typeof h !== 'string' || h.length > 100))) {
      return NextResponse.json({ error: 'Hobbies must be an array of strings, each less than 100 characters' }, { status: 400 });
    }
    if (awards && (!Array.isArray(awards) || awards.some((a: any) => typeof a.title !== 'string' || typeof a.issuer !== 'string' || typeof a.year !== 'number' || typeof a.description !== 'string'))) {
      return NextResponse.json({ error: 'Awards must be an array of objects with string title, issuer, description, and number year' }, { status: 400 });
    }
    if (references && (!Array.isArray(references) || references.some((r: any) => typeof r.name !== 'string' || typeof r.designation !== 'string' || typeof r.contact !== 'string'))) {
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
    const teamsCollection = db.collection(COLLECTION);

    // Check if supportiveEmail is unique (optional, but added for consistency)
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

    // Fetch user data to get firstName and lastName
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    console.log(userId)
    console.log(user)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate slug (use providedSlug if valid, otherwise generate from firstName and lastName)
    let slug = providedSlug || generateSlug(user.firstName || '', user.lastName || '');
    slug = await ensureUniqueSlug(db, slug);

    // Create team object
    const teamData = {
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
      awards: awards || [],
      references: references || [],
      supportiveEmail: lowerEmail,
      designation: designation || '', // Include designation
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