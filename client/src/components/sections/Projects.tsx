import { motion } from "framer-motion";
import { projects } from "@/lib/constants";
import { FaCheck, FaSpinner } from "react-icons/fa";

interface ProjectCardProps {
  title: string;
  description: string;
  status: string;
  tags: string[];
  index: number;
}

const ProjectCard = ({ title, description, status, tags, index }: ProjectCardProps) => {
  const getPlaceholderSvg = (index: number) => {
    if (index === 0) {
      // Shadow Protocol
      return (
        <svg
          className="w-full h-48"
          viewBox="0 0 300 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="300" height="200" fill="#000" />
          <text x="150" y="100" fill="#888" fontSize="20" textAnchor="middle">SHADOW</text>
          <text x="150" y="130" fill="#888" fontSize="20" textAnchor="middle">PROTOCOL</text>
        </svg>
      );
    } else if (index === 1) {
      // Speed Dash
      return (
        <svg
          className="w-full h-48"
          viewBox="0 0 300 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="300" height="200" fill="#fff" />
          <circle cx="150" cy="100" r="60" fill="#000" />
          <polygon points="130,70 190,100 130,130" fill="#fff" />
        </svg>
      );
    } else if (index === 2) {
      // The Chasing Dark
      return (
        <svg
          className="w-full h-48"
          viewBox="0 0 300 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="300" height="200" fill="#111" />
          <text x="150" y="100" fill="#f00" fontSize="24" textAnchor="middle">THE</text>
          <text x="150" y="130" fill="#f00" fontSize="24" textAnchor="middle">CHASING DARK</text>
        </svg>
      );
    } else {
      // Fury Arena
      return (
        <svg
          className="w-full h-48"
          viewBox="0 0 300 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="300" height="200" fill="#330066" />
          <text x="150" y="100" fill="#ffcc00" fontSize="32" textAnchor="middle">FURY</text>
          <text x="150" y="140" fill="#ffcc00" fontSize="24" textAnchor="middle">ARENA</text>
        </svg>
      );
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "development") {
      return (
        <div className="status-development">
          In Development <FaSpinner className="inline ml-1 animate-spin" />
        </div>
      );
    } else if (status === "completed") {
      return (
        <div className="status-completed">
          Completed <FaCheck className="inline ml-1" />
        </div>
      );
    } else if (status === "progress") {
      return (
        <div className="status-progress">
          In Progress <FaSpinner className="inline ml-1 animate-spin" />
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="project-card"
    >
      <div className="overflow-hidden">
        {getPlaceholderSvg(index)}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 text-primary">{title}</h3>
        <p className="text-sm mb-4">{description}</p>
        <div className="mb-4">
          {getStatusBadge(status)}
        </div>
      </div>
    </motion.div>
  );
};

export default function Projects() {
  return (
    <section id="projects" className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4 retro-text">
          Projects
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {projects.map((project, index) => (
          <ProjectCard
            key={index}
            title={project.title}
            description={project.description}
            status={project.status}
            tags={project.tags}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
