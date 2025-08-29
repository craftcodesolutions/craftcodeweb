/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import { verifyAuth } from '@/lib/auth';

const DB_NAME = 'CraftCode';
const COLLECTION = 'projects';

// Define interfaces for type safety
interface Milestone {
  name: string;
  completed: boolean;
  date: string;
}

interface ProjectInput {
  title: string;
  author: string;
  coAuthors?: string[];
  client: string;
  startDate?: string;
  deadline?: string;
  deliveryDate?: string;
  description: string;
  techStack?: string[];
  tools?: string[];
  category: string;
  status?: string;
  priority?: string;
  slug: string;
  imageUrl?: string | null;
  publicId?: string | null;
  projectUrl?: string;
  repoUrl?: string;
  deployment?: string;
  budget?: number | null;
  currency?: string;
  contractType?: string;
  paymentStatus?: string;
  featured?: boolean;
  caseStudy?: string;
  milestones?: Milestone[];
}

interface ProjectDB {
  title: string;
  author: string;
  coAuthors: string[];
  client: string;
  startDate?: Date | string;
  deadline?: Date | string;
  deliveryDate?: Date | string;
  description: string;
  techStack: string[];
  tools: string[];
  category: string;
  status: string;
  priority: string;
  slug: string;
  imageUrl: string | null;
  publicId: string | null;
  projectUrl: string;
  repoUrl: string;
  deployment: string;
  budget: number | null;
  currency: string;
  contractType: string;
  paymentStatus: string;
  featured: boolean;
  caseStudy: string;
  milestones: Milestone[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface ProjectResponse {
  _id: string;
  title: string;
  author: string;
  coAuthors: string[];
  client: string;
  startDate: string | null;
  deadline: string | null;
  deliveryDate: string | null;
  description: string;
  techStack: string[];
  tools: string[];
  category: string;
  status: string;
  priority: string;
  slug: string;
  imageUrl: string | null;
  publicId: string | null;
  projectUrl: string;
  repoUrl: string;
  deployment: string;
  budget: number | null;
  currency: string;
  contractType: string;
  paymentStatus: string;
  featured: boolean;
  caseStudy: string;
  milestones: Milestone[];
  createdAt: string | null;
  updatedAt: string | null;
}

// Helper function to safely convert dates
function normalizeDate(date: any): string | null {
  if (!date) return null;
  try {
    return new Date(date).toISOString();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const search = searchParams.get('search') || '';

    if (page < 1 || limit < 1) {
      return NextResponse.json({ error: 'Invalid page or limit' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const projectsCollection = db.collection<ProjectDB>(COLLECTION);

    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const totalProjects = await projectsCollection.countDocuments(query);
    const totalPages = Math.ceil(totalProjects / limit);

    const projects = await projectsCollection
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const projectResponses: ProjectResponse[] = projects.map((project) => ({
      _id: project._id.toString(),
      title: project.title,
      author: project.author,
      coAuthors: project.coAuthors || [],
      client: project.client,
      startDate: normalizeDate(project.startDate),
      deadline: normalizeDate(project.deadline),
      deliveryDate: normalizeDate(project.deliveryDate),
      description: project.description,
      techStack: project.techStack || [],
      tools: project.tools || [],
      category: project.category,
      status: project.status,
      priority: project.priority,
      slug: project.slug,
      imageUrl: project.imageUrl || null,
      publicId: project.publicId || null,
      projectUrl: project.projectUrl || '',
      repoUrl: project.repoUrl || '',
      deployment: project.deployment || '',
      budget: project.budget || null,
      currency: project.currency || 'USD',
      contractType: project.contractType || '',
      paymentStatus: project.paymentStatus || 'pending',
      featured: !!project.featured,
      caseStudy: project.caseStudy || '',
      milestones: project.milestones || [],
      createdAt: normalizeDate(project.createdAt),
      updatedAt: normalizeDate(project.updatedAt),
    }));

    return NextResponse.json(
      {
        projects: projectResponses,
        totalPages,
        currentPage: page,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ProjectInput = await req.json();
    const {
      title,
      author,
      coAuthors = [],
      client,
      startDate,
      deadline,
      deliveryDate,
      description,
      techStack = [],
      tools = [],
      category,
      status = 'ongoing',
      priority = 'medium',
      slug,
      imageUrl,
      publicId,
      projectUrl = '',
      repoUrl = '',
      deployment = '',
      budget,
      currency = 'USD',
      contractType = '',
      paymentStatus = 'pending',
      featured = false,
      caseStudy = '',
      milestones = [],
    } = body;

    // Validation
    if (!title || !author || !client || !description || !category || !slug) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    if (title.length < 3) {
      return NextResponse.json({ error: 'Title must be at least 3 characters long' }, { status: 400 });
    }

    if (description.length < 10) {
      return NextResponse.json({ error: 'Description must be at least 10 characters long' }, { status: 400 });
    }

    const validCategories = ['Web Development', 'Mobile Development', 'Backend', 'Frontend', 'Fullstack', 'Design', 'Other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const validStatuses = ['ongoing', 'completed', 'paused', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
    }

    if (author !== user.userId) {
      return NextResponse.json({ error: 'You can only create projects for yourself' }, { status: 403 });
    }

    // Validate milestones
    if (milestones.length > 0) {
      for (const milestone of milestones) {
        if (!milestone.name || typeof milestone.completed !== 'boolean' || !milestone.date) {
          return NextResponse.json({ error: 'Invalid milestone data' }, { status: 400 });
        }
      }
    }

    const clientDB = await clientPromise;
    const db = clientDB.db(DB_NAME);
    const projectsCollection = db.collection<ProjectDB>(COLLECTION);

    const existingProject = await projectsCollection.findOne({ slug });
    if (existingProject) {
      return NextResponse.json({ error: 'A project with this slug already exists' }, { status: 400 });
    }

    const projectData: ProjectDB = {
      title,
      author,
      coAuthors,
      client,
      startDate: startDate ? new Date(startDate) : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
      description,
      techStack,
      tools,
      category,
      status,
      priority,
      slug,
      imageUrl: imageUrl || null,
      publicId: publicId || null,
      projectUrl,
      repoUrl,
      deployment,
      budget: budget || null,
      currency,
      contractType,
      paymentStatus,
      featured,
      caseStudy,
      milestones,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await projectsCollection.insertOne(projectData);

    if (!result.insertedId) {
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    const insertedProject: ProjectResponse = {
      _id: result.insertedId.toString(),
      title: projectData.title,
      author: projectData.author,
      coAuthors: projectData.coAuthors,
      client: projectData.client,
      startDate: normalizeDate(projectData.startDate),
      deadline: normalizeDate(projectData.deadline),
      deliveryDate: normalizeDate(projectData.deliveryDate),
      description: projectData.description,
      techStack: projectData.techStack,
      tools: projectData.tools,
      category: projectData.category,
      status: projectData.status,
      priority: projectData.priority,
      slug: projectData.slug,
      imageUrl: projectData.imageUrl,
      publicId: projectData.publicId,
      projectUrl: projectData.projectUrl,
      repoUrl: projectData.repoUrl,
      deployment: projectData.deployment,
      budget: projectData.budget,
      currency: projectData.currency,
      contractType: projectData.contractType,
      paymentStatus: projectData.paymentStatus,
      featured: projectData.featured,
      caseStudy: projectData.caseStudy,
      milestones: projectData.milestones,
      createdAt: normalizeDate(projectData.createdAt),
      updatedAt: normalizeDate(projectData.updatedAt),
    };

    return NextResponse.json(insertedProject, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
