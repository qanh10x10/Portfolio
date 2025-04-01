import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import Projects from "./components/sections/Projects";
import Contact from "./components/sections/Contact";

function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    // Add smooth scrolling behavior
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = target.getAttribute('href')?.substring(1);
        if (id) {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`min-h-screen ${theme === "dark" ? "bg-black" : "bg-gray-100"} crt-effect`}>
        <main className="container mx-auto px-4 py-10">
          <header className="text-center mb-12">
            <h1 
              className="text-3xl md:text-5xl font-bold mb-3 retro-text glitch" 
              data-text="Quang Anh's Game Development Portfolio"
            >
              Quang Anh's Game Development Portfolio
            </h1>
            <p className="text-sm md:text-base mb-6 retro-text scanline">
              Welcome to my retro-style game development showcase.
            </p>
            <div className="flex justify-center items-center gap-4 mb-6">
              <a href="#projects" className="text-primary hover:text-white transition-colors duration-300">Projects</a>
              <a href="#contact" className="text-primary hover:text-white transition-colors duration-300">Contact</a>
            </div>
            <button 
              onClick={toggleTheme} 
              className="retro-button"
            >
              TOGGLE THEME
            </button>
          </header>
          
          <Projects />
          <Contact />
          
          <footer className="text-center mt-10 pt-6 border-t border-primary/30">
            <p className="text-xs text-primary/70">
              &copy; {new Date().getFullYear()} Quang Anh's Game Portfolio. All rights reserved.
            </p>
          </footer>
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
