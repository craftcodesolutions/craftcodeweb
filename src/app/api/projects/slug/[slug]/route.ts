/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';

const DB_NAME = 'CraftCode';
const COLLECTION = 'projects';

interface Milestone {
  name: string;
  completed: boolean;
  date: string;
}

interface Project {
  _id: string;
  title: string;
  author: string;
  coAuthors: string[];
  client: string;
  startDate?: string | null;
  deadline?: string | null;
  deliveryDate?: string | null;
  description: string;
  techStack: string[];
  tools: string[];
  category: string;
  status: string;
  priority: string;
  slug: string;
  imageUrl?: string | null;
  publicId?: string | null;
  projectUrl: string;
  repoUrl: string;
  deployment: string;
  budget?: number | null;
  currency: string;
  contractType: string;
  paymentStatus: string;
  featured: boolean;
  caseStudy: string;
  milestones: Milestone[];
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
    // ✅ Get slug from URL path instead of context
    const url = new URL(req.url);
    const slug = url.pathname.split('/').pop(); // last segment

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const projectsCollection = db.collection(COLLECTION);

    const project = await projectsCollection.findOne({ slug });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const formattedProject: Project = {
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
    };

    return NextResponse.json(formattedProject, { status: 200 });
  } catch (error) {
    console.error('Fetch project error:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}
