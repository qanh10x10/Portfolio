import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="bg-black border-2 border-primary text-primary font-pixel py-2 px-4 text-sm hover:bg-primary hover:text-black transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      TOGGLE THEME
    </motion.button>
  );
};

export default ThemeToggle;
