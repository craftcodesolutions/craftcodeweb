/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

interface ProjectCardProps {
  project: {
    _id: string;
    title: string;
    projectUrl: string;
    slug: string;
    imageUrl?: string;
    description?: string;
    techStack?: string[];
    status?: 'active' | 'completed' | 'in-progress';
    author: {
      userId: string;
      name: string;
      avatar?: string | null;
      email?: string | null;
      bio: string;
      createdAt?: string;
      updatedAt?: string;
    };
    date: string;
  };
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const [coverImageError, setCoverImageError] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const isValidAvatar =
    project.author?.avatar &&
    typeof project.author.avatar === "string" &&
    project.author.avatar.trim() !== "";

  const authorInitials = project.author?.name
    ? project.author.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "AU";

  return (
    <div className="group relative bg-gradient-to-br cursor-pointer from-[#1a1a2e] to-[#16213e] border border-[#313244] rounded-xl overflow-hidden transition-all duration-300 hover:border-[#4a4a6a] hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
      {/* Cover Image Preview */}
      {project.imageUrl && !coverImageError ? (
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={project.imageUrl}
            alt={`${project.title} cover`}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            onError={() => setCoverImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-[#2a2a3a] to-[#313244] flex items-center justify-center">
          <div className="text-4xl text-[#6b7280]">📁</div>
        </div>
      )}

      {/* Project Info */}
      <div className="p-6 flex flex-col space-y-4">
        {/* Author & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-sm bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
              {isValidAvatar && !avatarImageError ? (
                <img
                  src={project.author.avatar!}
                  alt={project.author.name}
                  className="object-cover w-12 h-12"
                  onError={() => setAvatarImageError(true)}
                />
              ) : (
                <div className="text-white font-semibold text-sm">
                  {authorInitials}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <h3 className="text-gray-900 dark:text-white font-semibold text-base sm:text-lg">
                {project.author?.name || "Unknown Author"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                {project.date
                  ? new Date(project.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  : "Unknown Date"}
              </p>
            </div>
          </div>

          {project.status && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(project.status)} whitespace-nowrap`}>
              {project.status}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div className="flex-1 flex flex-col justify-between space-y-2">
          <a
            href={`/projects/${project.slug}`}
            className="text-white text-lg sm:text-xl font-bold line-clamp-2 group-hover:text-purple-300 transition-colors duration-200"
            title={project.title}
          >
            {project.title}
          </a>
          {project.description && (
            <p className="text-sm text-gray-400 line-clamp-3">
              {project.description}
            </p>
          )}
        </div>

        {/* URL */}
        <div className="space-y-2">
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 group/link"
            title={project.projectUrl}
          >
            <span className="truncate">{project.projectUrl}</span>
            <svg className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Technologies */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.techStack.slice(0, 3).map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium bg-[#2a2a3a] text-gray-300 rounded-md border border-[#3a3a4a] hover:border-purple-500/50 transition-colors duration-200"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="px-2 py-1 text-xs font-medium bg-[#2a2a3a] text-gray-400 rounded-md border border-[#3a3a4a]">
                +{project.techStack.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            View Project
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;