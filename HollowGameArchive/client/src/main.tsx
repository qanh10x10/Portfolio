import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { motion, AnimatePresence } from "framer-motion";

const MotionApp = () => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <App />
    </motion.div>
  </AnimatePresence>
);

createRoot(document.getElementById("root")!).render(<MotionApp />);
