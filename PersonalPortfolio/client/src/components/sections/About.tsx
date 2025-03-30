import { Button } from "@/components/ui/button";
import { FaDownload } from "react-icons/fa";
import { FadeIn, SlideIn } from "@/components/ui/motion";

export default function About() {
  return (
    <section id="about" className="py-20 bg-background/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            About <span className="text-primary">Me</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto"></div>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <SlideIn className="lg:w-2/5">
            <div className="rounded-lg shadow-lg overflow-hidden">
              <svg 
                viewBox="0 0 600 400" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-full"
              >
                <rect width="600" height="400" fill="#1e293b" />
                <circle cx="300" cy="140" r="60" fill="#0ea5e9" fillOpacity="0.2" />
                <rect x="120" y="80" width="360" height="240" rx="8" fill="#0f172a" />
                <rect x="150" y="120" width="180" height="12" rx="2" fill="#64748b" />
                <rect x="150" y="144" width="300" height="8" rx="2" fill="#475569" />
                <rect x="150" y="164" width="300" height="8" rx="2" fill="#475569" />
                <rect x="150" y="184" width="240" height="8" rx="2" fill="#475569" />
                <rect x="150" y="214" width="160" height="24" rx="4" fill="#0ea5e9" />
                <rect x="150" y="250" width="300" height="1" rx="0.5" fill="#334155" />
                <rect x="150" y="270" width="140" height="8" rx="2" fill="#475569" />
                <rect x="150" y="290" width="100" height="8" rx="2" fill="#475569" />
                <circle cx="500" cy="80" r="30" fill="#0ea5e9" fillOpacity="0.3" />
                <circle cx="120" cy="320" r="40" fill="#0ea5e9" fillOpacity="0.2" />
              </svg>
            </div>
          </SlideIn>
          
          <FadeIn className="lg:w-3/5">
            <h3 className="text-2xl font-bold mb-4">
              A passionate <span className="text-primary">Web Developer</span> based in New York
            </h3>
            <p className="text-gray-300 mb-6">
              I'm a full stack developer with a passion for creating beautiful, functional, and user-friendly websites and applications. With 5 years of experience in the field, I've worked on a variety of projects from small business websites to large-scale web applications.
            </p>
            <p className="text-gray-300 mb-6">
              My approach combines technical skills with creative problem-solving to deliver solutions that meet both user needs and business goals. I'm constantly learning and experimenting with new technologies to stay at the forefront of web development.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div>
                <p><span className="font-semibold text-primary">Name:</span> John Doe</p>
                <p><span className="font-semibold text-primary">Degree:</span> Bachelor in Computer Science</p>
                <p><span className="font-semibold text-primary">Experience:</span> 5 Years</p>
              </div>
              <div>
                <p><span className="font-semibold text-primary">Phone:</span> +1 (555) 123-4567</p>
                <p><span className="font-semibold text-primary">Email:</span> john.doe@example.com</p>
                <p><span className="font-semibold text-primary">Location:</span> New York, USA</p>
              </div>
            </div>
            <Button className="bg-primary hover:bg-secondary text-white font-medium transition duration-300">
              Download CV
              <FaDownload className="ml-2" />
            </Button>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
