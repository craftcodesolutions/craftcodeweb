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
const ensureUniqueSlug = async (db: any, baseSlug: string, excludeId?: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;
  while (
    await db.collection(COLLECTION).findOne({
      slug,
      _id: { $ne: excludeId ? new ObjectId(excludeId) : undefined },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Await params to resolve the Promise
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

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
      // User data fields
      firstName,
      lastName,
      bio,
      profileImage,
      publicIdProfile,
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
    
    // Validation for user fields (if provided)
    if (firstName && (typeof firstName !== 'string' || firstName.length < 1)) {
      return NextResponse.json({ error: 'First name must be a non-empty string' }, { status: 400 });
    }
    if (lastName && (typeof lastName !== 'string' || lastName.length < 1)) {
      return NextResponse.json({ error: 'Last name must be a non-empty string' }, { status: 400 });
    }
    if (bio && (typeof bio !== 'string' || bio.length > 500)) {
      return NextResponse.json({ error: 'Bio must be a string and less than 500 characters' }, { status: 400 });
    }
    if (profileImage && typeof profileImage !== 'string') {
      return NextResponse.json({ error: 'Profile image must be a string' }, { status: 400 });
    }
    if (banner && (typeof banner !== 'string' || banner.length > 1000)) {
      return NextResponse.json(
        { error: 'Banner URL must be a string and less than 1000 characters' },
        { status: 400 }
      );
    }
    if (publicIdBanner && (typeof publicIdBanner !== 'string' || publicIdBanner.length > 200)) {
      return NextResponse.json(
        { error: 'Public ID for banner must be a string and less than 200 characters' },
        { status: 400 }
      );
    }
    if (
      providedSlug &&
      (typeof providedSlug !== 'string' ||
        !/^[a-z0-9-]+$/.test(providedSlug) ||
        providedSlug.length > 100)
    ) {
      return NextResponse.json(
        {
          error:
            'Slug must be a string, contain only lowercase letters, numbers, and hyphens, and be less than 100 characters',
        },
        { status: 400 }
      );
    }
    if (skills && (!Array.isArray(skills) || skills.some((s: any) => typeof s !== 'string' || s.length > 100))) {
      return NextResponse.json(
        { error: 'Skills must be an array of strings, each less than 100 characters' },
        { status: 400 }
      );
    }
    if (
      previousJobs &&
      (!Array.isArray(previousJobs) ||
        previousJobs.some(
          (j: any) =>
            typeof j.title !== 'string' ||
            typeof j.company !== 'string' ||
            typeof j.startDate !== 'string' ||
            typeof j.endDate !== 'string' ||
            typeof j.description !== 'string'
        ))
    ) {
      return NextResponse.json(
        { error: 'Previous jobs must be an array of objects with string title, company, startDate, endDate, and description' },
        { status: 400 }
      );
    }
    if (
      projectLinks &&
      (!Array.isArray(projectLinks) ||
        projectLinks.some(
          (p: any) => typeof p.title !== 'string' || typeof p.url !== 'string' || typeof p.description !== 'string'
        ))
    ) {
      return NextResponse.json(
        { error: 'Project links must be an array of objects with string title, url, and description' },
        { status: 400 }
      );
    }
    if (
      education &&
      (!Array.isArray(education) ||
        education.some(
          (e: any) =>
            typeof e.degree !== 'string' ||
            typeof e.institution !== 'string' ||
            typeof e.startYear !== 'number' ||
            typeof e.endYear !== 'number' ||
            typeof e.description !== 'string'
        ))
    ) {
      return NextResponse.json(
        { error: 'Education must be an array of objects with string degree, institution, description, and number startYear, endYear' },
        { status: 400 }
      );
    }
    if (
      certifications &&
      (!Array.isArray(certifications) ||
        certifications.some(
          (c: any) => typeof c.title !== 'string' || typeof c.issuer !== 'string' || typeof c.year !== 'number'
        ))
    ) {
      return NextResponse.json(
        { error: 'Certifications must be an array of objects with string title, issuer, and number year' },
        { status: 400 }
      );
    }
    if (
      languages &&
      (!Array.isArray(languages) ||
        languages.some((l: any) => typeof l.name !== 'string' || typeof l.proficiency !== 'string'))
    ) {
      return NextResponse.json(
        { error: 'Languages must be an array of objects with string name and proficiency' },
        { status: 400 }
      );
    }
    if (hobbies && (!Array.isArray(hobbies) || hobbies.some((h: any) => typeof h !== 'string' || h.length > 100))) {
      return NextResponse.json(
        { error: 'Hobbies must be an array of strings, each less than 100 characters' },
        { status: 400 }
      );
    }
    if (
      awards &&
      (!Array.isArray(awards) ||
        awards.some(
          (a: any) =>
            typeof a.title !== 'string' ||
            typeof a.issuer !== 'string' ||
            typeof a.year !== 'number' ||
            typeof a.description !== 'string'
        ))
    ) {
      return NextResponse.json(
        { error: 'Awards must be an array of objects with string title, issuer, description, and number year' },
        { status: 400 }
      );
    }
    if (
      references &&
      (!Array.isArray(references) ||
        references.some(
          (r: any) => typeof r.name !== 'string' || typeof r.designation !== 'string' || typeof r.contact !== 'string'
        ))
    ) {
      return NextResponse.json(
        { error: 'References must be an array of objects with string name, designation, and contact' },
        { status: 400 }
      );
    }
    if (!supportiveEmail || !/^\S+@\S+\.\S+$/.test(supportiveEmail) || supportiveEmail.length > 100) {
      return NextResponse.json(
        { error: 'Valid supportive email is required and must be less than 100 characters' },
        { status: 400 }
      );
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

    // Check if team entry exists and belongs to the user
    const existingTeam = await teamsCollection.findOne({ _id: new ObjectId(id), userId });
    if (!existingTeam) {
      return NextResponse.json({ error: 'Team profile not found or unauthorized' }, { status: 404 });
    }

    // Fetch existing user data
    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user data if provided
    if (firstName || lastName || bio || profileImage || publicIdProfile) {
      const updateData: any = {
        updatedAt: new Date()
      };
      
      // Update firstName and lastName fields directly
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      
      if (bio !== undefined) updateData.bio = bio;
      if (profileImage !== undefined) updateData.profileImage = profileImage;
      if (publicIdProfile !== undefined) updateData.publicIdProfile = publicIdProfile;
      
      // Update user in database
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateData }
      );
    }

    // Get updated user data for slug generation
    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    const userFirstName = updatedUser?.firstName || '';
    const userLastName = updatedUser?.lastName || '';

    // Generate slug (use providedSlug if valid, otherwise generate from firstName and lastName)
    let slug = providedSlug || generateSlug(userFirstName, userLastName);
    slug = await ensureUniqueSlug(db, slug, id); // Exclude current team ID from uniqueness check

    // Create updated team object
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
      supportiveEmail: supportiveEmail.toLowerCase(),
      designation: designation || '', // Include designation
      updatedAt: new Date(),
    };

    // Update team data in database
    const result = await teamsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: teamData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to update team profile' }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: 'Team profile updated successfully', slug },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update team error:', error);
    return NextResponse.json({ error: 'Failed to update team profile' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Await params to resolve the Promise
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const teamsCollection = db.collection(COLLECTION);

    // Check if team entry exists
    const existingTeam = await teamsCollection.findOne({ _id: new ObjectId(id) });
    if (!existingTeam) {
      return NextResponse.json({ error: 'Team profile not found' }, { status: 404 });
    }

    // Delete team data from database
    const result = await teamsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete team profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Team profile deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete team error:', error);
    return NextResponse.json({ error: 'Failed to delete team profile' }, { status: 500 });
  }
}