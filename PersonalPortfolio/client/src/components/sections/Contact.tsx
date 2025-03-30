import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { contactInfo } from "@/lib/constants";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    doubt: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.doubt) {
      toast({
        title: "Error",
        description: "Please fill out all fields",
        variant: "destructive"
      });
      return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real application, you would send this data to a server
      // Simulating a server request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success!",
        description: "Your doubt has been submitted successfully.",
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        doubt: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="mt-20">
      <motion.div 
        className="retro-container"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-6 retro-text">
            Have a Doubt?
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col gap-4">
          <div>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="border border-primary bg-black text-primary p-2 w-full"
              placeholder="Your Name"
            />
          </div>
          <div>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="border border-primary bg-black text-primary p-2 w-full"
              placeholder="Your Email"
            />
          </div>
          <div>
            <Textarea
              id="doubt"
              value={formData.doubt}
              onChange={handleChange}
              rows={3}
              className="border border-primary bg-black text-primary p-2 w-full resize-none"
              placeholder="Type your doubt here..."
            />
          </div>
          
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="retro-button self-center mt-2"
          >
            {isSubmitting ? "SUBMITTING..." : "SUBMIT DOUBT"}
          </Button>
        </form>
        
        <div className="text-center mt-10">
          <h3 className="text-lg font-bold mb-3 retro-text">Contact Me</h3>
          <p className="text-xs mb-2">
            If you have any questions, feel free to reach out.
          </p>
          <p className="text-xs mb-4">
            Phone: {contactInfo.phone}
          </p>
          <div className="flex justify-center">
            <a 
              href={contactInfo.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition duration-300 flex items-center gap-1 text-xs"
            >
              LinkedIn: <span className="text-primary underline">Visit My LinkedIn</span>
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
