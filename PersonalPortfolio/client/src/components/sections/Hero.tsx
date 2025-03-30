import { Button } from "@/components/ui/button";
import { FaArrowRight, FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section id="home" className="pt-24 lg:pt-0 min-h-screen flex items-center">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center">
          <motion.div 
            className="lg:w-1/2 lg:pr-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full mb-4 text-sm font-medium">
              Full Stack Developer
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Hi, I'm <span className="text-primary">John Doe</span>
              <br />
              Web Developer
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-lg">
              I build exceptional and accessible digital experiences for the web. Focused on creating intuitive and responsive web applications.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                asChild
                size="lg"
                className="bg-primary hover:bg-secondary text-white font-medium rounded-md transition duration-300 inline-flex items-center"
              >
                <a href="#projects">
                  View My Work
                  <FaArrowRight className="ml-2" />
                </a>
              </Button>
              <Button 
                asChild
                variant="outline" 
                size="lg"
                className="border border-primary text-primary hover:bg-primary/10 font-medium rounded-md transition duration-300"
              >
                <a href="#contact">
                  Contact Me
                </a>
              </Button>
            </div>
            <div className="mt-10 flex space-x-5">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition duration-300">
                <FaGithub size={22} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition duration-300">
                <FaLinkedin size={22} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition duration-300">
                <FaTwitter size={22} />
              </a>
              <a href="mailto:john.doe@example.com" className="text-gray-400 hover:text-primary transition duration-300">
                <FaEnvelope size={22} />
              </a>
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2 mt-12 lg:mt-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-3xl opacity-20 blur-3xl"></div>
              <svg
                className="relative z-10 rounded-3xl w-full max-w-md mx-auto object-cover shadow-xl"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="400" height="400" rx="16" fill="#1e293b" />
                <circle cx="200" cy="170" r="70" fill="#0ea5e9" fillOpacity="0.2" />
                <path
                  d="M200 280C178.954 280 160 261.046 160 240C160 218.954 178.954 200 200 200C221.046 200 240 218.954 240 240C240 261.046 221.046 280 200 280Z"
                  fill="#0ea5e9"
                  fillOpacity="0.2"
                />
                <path
                  d="M136 148C136 126.954 153.072 110 174.117 110H226.883C247.928 110 265 126.954 265 148V162C265 183.046 247.928 200 226.883 200H174.117C153.072 200 136 183.046 136 162V148Z"
                  fill="#0ea5e9"
                  fillOpacity="0.1"
                />
                <circle cx="200" cy="150" r="50" fill="#0f172a" />
                <path
                  d="M200 170C211.046 170 220 161.046 220 150C220 138.954 211.046 130 200 130C188.954 130 180 138.954 180 150C180 161.046 188.954 170 200 170Z"
                  fill="#0ea5e9"
                />
                <path
                  d="M170 230C170 212.327 183.49 198 200 198C216.51 198 230 212.327 230 230V250C230 250 215 260 200 260C185 260 170 250 170 250V230Z"
                  fill="#0ea5e9"
                />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
