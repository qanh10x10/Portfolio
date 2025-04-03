import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 10;
        const newValue = Math.min(prev + increment, 100);
        
        if (newValue >= 100) {
          clearInterval(interval);
        }
        
        return newValue;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center"
    >
      <motion.div 
        className="text-4xl md:text-6xl font-pixel text-primary text-glow mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        HOLLOW GAMES
      </motion.div>
      
      <motion.div 
        className="w-16 h-16 bg-primary mb-8"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ 
          repeat: Infinity,
          duration: 2,
        }}
      />
      
      <motion.div 
        className="text-xl font-retro text-primary mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        LOADING GAME DATA...
      </motion.div>
      
      <div className="w-64 h-4 border-2 border-primary relative overflow-hidden">
        <motion.div 
          className="h-full bg-primary"
          style={{ width: `${progress}%` }}
          transition={{ type: 'spring' }}
        />
      </div>
      
      <div className="text-primary font-retro mt-2">
        {Math.round(progress)}%
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
