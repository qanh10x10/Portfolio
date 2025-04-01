import { FadeIn } from "@/components/ui/motion";
import { ProgressBar } from "@/components/ui/motion";
import { 
  FaReact, 
  FaNodeJs, 
  FaJs, 
  FaHtml5, 
  FaCss3Alt, 
  FaGitAlt 
} from "react-icons/fa";

interface SkillBarProps {
  name: string;
  percentage: number;
}

function SkillBar({ name, percentage }: SkillBarProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-1">
        <span className="font-medium">{name}</span>
        <span className="text-primary">{percentage}%</span>
      </div>
      <ProgressBar percentage={percentage} />
    </div>
  );
}

interface TechToolProps {
  icon: React.ReactNode;
  name: string;
}

function TechTool({ icon, name }: TechToolProps) {
  return (
    <div className="bg-background/80 p-4 rounded-lg text-center hover:bg-primary/10 transition duration-300">
      <div className="text-3xl text-primary mb-2 flex justify-center">
        {icon}
      </div>
      <p className="font-medium">{name}</p>
    </div>
  );
}

export default function Skills() {
  const skills = [
    { name: "HTML/CSS", percentage: 90 },
    { name: "JavaScript", percentage: 85 },
    { name: "React", percentage: 80 },
    { name: "Node.js", percentage: 75 }
  ];

  const techTools = [
    { icon: <FaReact />, name: "React" },
    { icon: <FaNodeJs />, name: "Node.js" },
    { icon: <FaJs />, name: "JavaScript" },
    { icon: <FaHtml5 />, name: "HTML5" },
    { icon: <FaCss3Alt />, name: "CSS3" },
    { icon: <FaGitAlt />, name: "Git" }
  ];

  return (
    <section id="skills" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            My <span className="text-primary">Skills</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            I've worked with a variety of technologies in the web development world.
            Here are some of my key skills and proficiencies.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <FadeIn>
            <h3 className="text-xl font-semibold mb-6 text-white">Technical Skills</h3>
            {skills.map((skill, index) => (
              <SkillBar 
                key={index} 
                name={skill.name} 
                percentage={skill.percentage} 
              />
            ))}
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <h3 className="text-xl font-semibold mb-6 text-white">Technologies & Tools</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {techTools.map((tool, index) => (
                <TechTool
                  key={index}
                  icon={tool.icon}
                  name={tool.name}
                />
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
