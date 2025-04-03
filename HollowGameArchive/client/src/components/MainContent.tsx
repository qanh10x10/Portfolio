import { useRef } from 'react';
import { motion } from 'framer-motion';
import { projects } from '../data/projects';
import ThemeToggle from './ui/theme-toggle';
import ProjectCard from './ProjectCard';
import { GithubIcon, FacebookIcon, LinkedinIcon } from 'lucide-react';

const MainContent = () => {
  const projectsRef = useRef<HTMLElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="relative min-h-screen grid-bg crt">
      {/* Navigation */}
      <motion.header 
        className="bg-black sticky top-0 z-40 border-b border-primary"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-xl md:text-3xl font-pixel text-primary text-glow">
            <a href="#" className="hover:opacity-80 transition-opacity">Hollow</a>
          </div>
          <div className="flex space-x-4 md:space-x-8 font-pixel text-sm md:text-base">
            <button 
              onClick={() => scrollToSection(projectsRef)} 
              className="text-primary text-glow hover:opacity-80 transition-opacity"
            >
              Projects
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        className="container mx-auto px-4 py-12 md:py-20 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.h1 
          className="text-2xl md:text-4xl lg:text-5xl font-pixel text-primary text-glow mb-4 animate-text-flicker"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          Hollow's Game Development Portfolio
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl font-retro text-primary mb-8"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
        >
          Welcome to my retro-style game development showcase.
        </motion.p>
        <ThemeToggle />
      </motion.section>

      {/* Projects Section */}
      <section 
        id="projects" 
        ref={projectsRef} 
        className="container mx-auto px-4 py-12 mb-12"
      >
        <motion.h2 
          className="text-2xl md:text-3xl font-pixel text-primary text-glow mb-8"
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          Projects
        </motion.h2>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {projects.map(project => (
            <motion.div key={project.id} variants={itemVariants}>
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="bg-black py-6 border-t border-primary"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="font-retro text-primary">&copy; 2025 Hollow's Games. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <a href="https://www.facebook.com/quanganh.chu.9619/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-secondary transition-colors">
              <span className="sr-only">Facebook</span>
              <FacebookIcon className="h-6 w-6" />
            </a>
            <a href="https://github.com/qanh10x10" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-secondary transition-colors">
              <span className="sr-only">GitHub</span>
              <GithubIcon className="h-6 w-6" />
            </a>
            <a href="https://www.linkedin.com/in/ch%E1%BB%AD-quang-anh-633bb3223/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-secondary transition-colors">
              <span className="sr-only">LinkedIn</span>
              <LinkedinIcon className="h-6 w-6" />
            </a>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default MainContent;
