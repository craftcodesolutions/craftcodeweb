/* eslint-disable @next/next/no-img-element */
interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    url: string;
    coverImage?: string;
    description?: string;
    technologies?: string[];
    status?: 'active' | 'completed' | 'in-progress';
  };
}

const ProjectCard = ({ project }: ProjectCardProps) => {
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

  return (
    <div className="group relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-[#313244] rounded-xl overflow-hidden transition-all duration-300 hover:border-[#4a4a6a] hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
      {/* Cover Image Preview */}
      {project.coverImage ? (
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={project.coverImage}
            alt={`${project.name} cover`}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-[#2a2a3a] to-[#313244] flex items-center justify-center">
          <div className="text-4xl text-[#6b7280]">📁</div>
        </div>
      )}

      {/* Project Info */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white truncate group-hover:text-purple-300 transition-colors duration-200" title={project.name}>
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          {project.status && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(project.status)} whitespace-nowrap`}>
              {project.status}
            </span>
          )}
        </div>

        {/* URL */}
        <div className="space-y-2">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 group/link"
            title={project.url}
          >
            <span className="truncate">{project.url}</span>
            <svg className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.technologies.slice(0, 3).map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium bg-[#2a2a3a] text-gray-300 rounded-md border border-[#3a3a4a] hover:border-purple-500/50 transition-colors duration-200"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="px-2 py-1 text-xs font-medium bg-[#2a2a3a] text-gray-400 rounded-md border border-[#3a3a4a]">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <a
            href={project.url}
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
