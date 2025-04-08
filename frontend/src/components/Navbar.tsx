
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Import auth service for authentication state management
import { authService } from "../services/authService";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Check authentication status when component mounts or location changes
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = authService.isAuthenticated();
      setIsAuthenticated(authStatus);
      
      if (authStatus) {
        setUser(authService.getUserData());
      } else {
        setUser(null);
      }
    };
    
    checkAuth();
  }, [location]);

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
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link to="/requests" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                My Requests
              </Link>
              <div className="relative group">
                <button className="flex items-center space-x-1 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  <span>{user?.name || 'Account'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile
                  </Link>
                  <Link to="/requests" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Requests
                  </Link>
                  <button 
                    onClick={() => {
                      authService.logout();
                      setIsAuthenticated(false);
                      setUser(null);
                      navigate('/');
                    }} 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
              <Link to="/requests/new" className="inline-flex items-center justify-center h-9 px-4 py-2 text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                New Request
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to="/auth" 
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/auth" 
                className="inline-flex items-center justify-center h-9 px-4 py-2 text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
        
        <div className="md:hidden flex items-center">
          {isAuthenticated ? (
            <Link to="/requests/new" className="mr-4 inline-flex items-center justify-center h-8 px-3 py-1 text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
              New Request
            </Link>
          ) : (
            <Link to="/auth" className="mr-4 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Sign In
            </Link>
          )}
          
          <button className="text-foreground" onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div id="mobile-menu" className="hidden md:hidden absolute top-full left-0 right-0 bg-white shadow-md p-4 z-50">
        <nav className="flex flex-col space-y-3">
          <a href="#how-it-works" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2">
            How it works
          </a>
          
          {isAuthenticated ? (
            <>
              <Link to="/requests" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2">
                My Requests
              </Link>
              <Link to="/profile" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2">
                Profile
              </Link>
              <button 
                onClick={() => {
                  authService.logout();
                  setIsAuthenticated(false);
                  setUser(null);
                  navigate('/');
                  document.getElementById('mobile-menu')?.classList.add('hidden');
                }} 
                className="text-left text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/auth" 
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
              >
                Sign In
              </Link>
              <Link 
                to="/auth" 
                className="text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors py-2 px-4 rounded-md inline-block"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
