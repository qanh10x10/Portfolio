import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={cn(
      "fixed w-full z-50 transition-all duration-300 backdrop-blur-sm",
      isScrolled ? "bg-background/90 shadow-md" : "bg-transparent"
    )}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <a href="#home" className="text-2xl font-bold text-primary">
            Portfolio<span className="text-white">.</span>
          </a>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li>
                <a 
                  href="#home" 
                  className="relative text-text-light hover:text-primary transition duration-300 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:bottom-[-2px] after:transition-[width] after:duration-300 hover:after:w-full"
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#about" 
                  className="relative text-text-light hover:text-primary transition duration-300 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:bottom-[-2px] after:transition-[width] after:duration-300 hover:after:w-full"
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="#skills" 
                  className="relative text-text-light hover:text-primary transition duration-300 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:bottom-[-2px] after:transition-[width] after:duration-300 hover:after:w-full"
                >
                  Skills
                </a>
              </li>
              <li>
                <a 
                  href="#projects" 
                  className="relative text-text-light hover:text-primary transition duration-300 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:bottom-[-2px] after:transition-[width] after:duration-300 hover:after:w-full"
                >
                  Projects
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  className="relative text-text-light hover:text-primary transition duration-300 after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:bottom-[-2px] after:transition-[width] after:duration-300 hover:after:w-full"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            id="menu-btn" 
            className={cn(
              "block md:hidden focus:outline-none relative w-6 h-6",
              isMenuOpen && "open"
            )}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={cn(
              "absolute w-6 h-0.5 bg-white transition-all duration-500",
              isMenuOpen ? "rotate-45 translate-y-0" : "rotate-0"
            )} />
            <span className={cn(
              "absolute w-6 h-0.5 bg-white transition-all duration-500 top-2.5",
              isMenuOpen && "opacity-0"
            )} />
            <span className={cn(
              "absolute w-6 h-0.5 bg-white transition-all duration-500 top-5",
              isMenuOpen ? "-rotate-45 -translate-y-2.5" : "rotate-0"
            )} />
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden bg-background/95 backdrop-blur-sm transition-all duration-300 overflow-hidden",
        isMenuOpen ? "max-h-64" : "max-h-0"
      )}>
        <div className="flex flex-col items-center py-8 space-y-6">
          <a 
            href="#home" 
            className="text-text-light hover:text-primary transition duration-300"
            onClick={closeMenu}
          >
            Home
          </a>
          <a 
            href="#about" 
            className="text-text-light hover:text-primary transition duration-300"
            onClick={closeMenu}
          >
            About
          </a>
          <a 
            href="#skills" 
            className="text-text-light hover:text-primary transition duration-300"
            onClick={closeMenu}
          >
            Skills
          </a>
          <a 
            href="#projects" 
            className="text-text-light hover:text-primary transition duration-300"
            onClick={closeMenu}
          >
            Projects
          </a>
          <a 
            href="#contact" 
            className="text-text-light hover:text-primary transition duration-300"
            onClick={closeMenu}
          >
            Contact
          </a>
        </div>
      </div>
    </header>
  );
}
