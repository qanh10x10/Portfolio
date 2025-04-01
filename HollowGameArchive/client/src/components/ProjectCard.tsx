import { motion } from 'framer-motion';
import { Progress } from './ui/progress';
import { Project } from '../data/projects';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-[#66FF99] green-glow';
      case 'In Development':
        return 'text-secondary pink-glow';
      case 'In Progress':
        return 'text-[#FFCC00] yellow-glow';
      default:
        return 'text-primary text-glow';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-[#66FF99]';
      case 'In Development':
        return 'bg-secondary';
      case 'In Progress':
        return 'bg-[#FFCC00]';
      default:
        return 'bg-primary';
    }
  };

  return (
    <motion.a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border-2 border-primary rounded-sm overflow-hidden hover:shadow-[0_0_15px_rgba(0,255,204,0.5)] transition-all duration-300"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="aspect-video bg-gray-800 overflow-hidden">
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110" 
        />
      </div>
      <div className="p-4 bg-black">
        <h3 className="font-pixel text-primary text-glow text-lg mb-2">{project.title}</h3>
        <p className="font-retro text-gray-300 text-sm mb-4">{project.description}</p>
        <div className="flex justify-between items-center mb-2">
          <span className={`font-pixel text-xs ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
        <Progress 
          value={project.progress} 
          className="h-2 bg-gray-800"
          indicatorClassName={getProgressColor(project.status)}
        />
      </div>
    </motion.a>
  );
};

export default ProjectCard;
