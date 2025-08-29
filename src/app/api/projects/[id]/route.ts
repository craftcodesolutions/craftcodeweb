import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import clientPromise from '@/config/mongodb';
import { v2 as cloudinary } from 'cloudinary';

// Cache MongoDB client
let cachedClient: MongoClient | null = null;

async function getClient(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }
  cachedClient = await clientPromise;
  return cachedClient;
}

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
  startDate?: Date;
  deadline?: Date;
  deliveryDate?: Date;
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
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: string;
  updatedAt: string;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ========================= PUT =========================
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const body: ProjectInput = await req.json();
    const {
      title,
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
    if (!title || !client || !description || !category || !slug) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }
    if (title.length < 3) {
      return NextResponse.json(
        { error: 'Title must be at least 3 characters long' },
        { status: 400 }
      );
    }
    if (description.length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters long' },
        { status: 400 }
      );
    }
    const validCategories = [
      'Web Development',
      'Mobile Development',
      'Backend',
      'Frontend',
      'Fullstack',
      'Design',
      'Other',
    ];
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
    const validCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'BDT'];
    if (!validCurrencies.includes(currency)) {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
    }
    const validContractTypes = ['fixed-price', 'hourly', 'retainer'];
    if (!validContractTypes.includes(contractType)) {
      return NextResponse.json({ error: 'Invalid contract type' }, { status: 400 });
    }
    const validPaymentStatuses = ['pending', 'paid', 'overdue'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
    }
    // Validate milestones
    if (milestones.length > 0) {
      for (const milestone of milestones) {
        if (!milestone.name || typeof milestone.completed !== 'boolean' || !milestone.date) {
          return NextResponse.json({ error: 'Invalid milestone data' }, { status: 400 });
        }
      }
    }

    // Connect to DB
    const mongoClient = await getClient();
    const db = mongoClient.db(DB_NAME);
    const projectsCollection = db.collection<ProjectDB>(COLLECTION);

    // Find project
    const project = await projectsCollection.findOne({ _id: new ObjectId(id) });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Authorization check
    const userId = req.headers.get('x-user-id');
    if (!userId || project.author !== userId) {
      return NextResponse.json(
        { error: 'You are not authorized to update this project' },
        { status: 403 }
      );
    }

    // Ensure slug is unique
    const existingProject = await projectsCollection.findOne({
      slug,
      _id: { $ne: new ObjectId(id) },
    });
    if (existingProject) {
      return NextResponse.json(
        { error: 'A project with this slug already exists' },
        { status: 400 }
      );
    }

    // Build updated project
    const updatedProject = {
      title,
      author: project.author,
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
      updatedAt: new Date(),
    };

    const result = await projectsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedProject }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }

    const updatedResponse: ProjectResponse = {
      _id: id,
      title: updatedProject.title,
      author: updatedProject.author,
      coAuthors: updatedProject.coAuthors,
      client: updatedProject.client,
      startDate: updatedProject.startDate?.toISOString() || null,
      deadline: updatedProject.deadline?.toISOString() || null,
      deliveryDate: updatedProject.deliveryDate?.toISOString() || null,
      description: updatedProject.description,
      techStack: updatedProject.techStack,
      tools: updatedProject.tools,
      category: updatedProject.category,
      status: updatedProject.status,
      priority: updatedProject.priority,
      slug: updatedProject.slug,
      imageUrl: updatedProject.imageUrl,
      publicId: updatedProject.publicId,
      projectUrl: updatedProject.projectUrl,
      repoUrl: updatedProject.repoUrl,
      deployment: updatedProject.deployment,
      budget: updatedProject.budget,
      currency: updatedProject.currency,
      contractType: updatedProject.contractType,
      paymentStatus: updatedProject.paymentStatus,
      featured: updatedProject.featured,
      caseStudy: updatedProject.caseStudy,
      milestones: updatedProject.milestones,
      createdAt: project.createdAt.toISOString(),
      updatedAt: updatedProject.updatedAt.toISOString(),
    };

    return NextResponse.json(updatedResponse, { status: 200 });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// ========================= DELETE =========================
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const mongoClient = await getClient();
    const db = mongoClient.db(DB_NAME);
    const projectsCollection = db.collection<ProjectDB>(COLLECTION);

    const project = await projectsCollection.findOne({ _id: new ObjectId(id) });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Authorization check
    const userId = req.headers.get('x-user-id');
    if (!userId || project.author !== userId) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this project' },
        { status: 403 }
      );
    }

    // Delete image from Cloudinary if it exists
    if (project.publicId) {
      try {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        await cloudinary.uploader.destroy(project.publicId);
      } catch (err) {
        console.error('Cloudinary image delete failed:', err);
      }
    }

    // Delete project
    const result = await projectsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: 'Project deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}