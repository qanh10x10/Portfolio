import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';

interface FormData {
  name: string;
  email: string;
  message: string;
}

const ContactSection = forwardRef<HTMLElement>((_, ref) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "Thanks for reaching out. I'll get back to you soon.",
    });
    
    reset();
    setIsSubmitting(false);
  };

  return (
    <motion.section 
      id="contact" 
      ref={ref}
      className="container mx-auto px-4 py-12 mb-12"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.h2 
        className="text-2xl md:text-3xl font-pixel text-primary text-glow mb-8"
        initial={{ x: -50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
      >
        Contact
      </motion.h2>
      
      <div className="max-w-2xl mx-auto border-2 border-primary p-6 bg-black bg-opacity-80">
        <p className="font-retro text-primary mb-6 text-lg">
          Want to collaborate or have questions about my games? Drop me a message!
        </p>
        
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="name" className="block font-pixel text-primary text-sm mb-2">YOUR NAME</label>
            <input 
              {...register('name', { required: 'Name is required' })}
              type="text" 
              id="name" 
              className="w-full bg-black border-2 border-primary px-4 py-2 text-white font-retro focus:outline-none focus:border-secondary focus:shadow-[0_0_10px_rgba(255,51,102,0.5)]" 
            />
            {errors.name && (
              <p className="text-secondary text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block font-pixel text-primary text-sm mb-2">YOUR EMAIL</label>
            <input 
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email" 
              id="email" 
              className="w-full bg-black border-2 border-primary px-4 py-2 text-white font-retro focus:outline-none focus:border-secondary focus:shadow-[0_0_10px_rgba(255,51,102,0.5)]" 
            />
            {errors.email && (
              <p className="text-secondary text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="message" className="block font-pixel text-primary text-sm mb-2">MESSAGE</label>
            <textarea 
              {...register('message', { required: 'Message is required' })}
              id="message" 
              rows={4} 
              className="w-full bg-black border-2 border-primary px-4 py-2 text-white font-retro focus:outline-none focus:border-secondary focus:shadow-[0_0_10px_rgba(255,51,102,0.5)]" 
            />
            {errors.message && (
              <p className="text-secondary text-sm mt-1">{errors.message.message}</p>
            )}
          </div>
          
          <motion.button 
            type="submit" 
            className="bg-primary text-black font-pixel py-2 px-6 hover:bg-secondary hover:text-white transition-colors disabled:opacity-50"
            disabled={isSubmitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
          </motion.button>
        </form>
      </div>
    </motion.section>
  );
});

ContactSection.displayName = 'ContactSection';

export default ContactSection;
