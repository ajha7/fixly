
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 px-6 md:px-10",
        scrolled 
          ? "bg-white/80 backdrop-blur shadow-subtle" 
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="#" className="text-xl font-semibold tracking-tight">
          <span className="text-primary">Fixly</span>
        </a>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#how-it-works" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            How it works
          </a>
          {/* <a href="#pricing" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Pricing
          </a> */}
          <a href="#get-access" className="inline-flex items-center justify-center h-9 px-4 py-2 text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
            Get Early Access
          </a>
        </nav>
        
        <button className="md:hidden text-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
