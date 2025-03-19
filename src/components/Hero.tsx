
import { useEffect, useRef } from "react";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll("[data-animate]");
            elements?.forEach((el) => {
              // Add the animation class but don't remove it
              el.classList.add("animate-fade-in");
              // Remove the opacity-0 class to ensure elements stay visible
              el.classList.remove("opacity-0");
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe the container instead of individual elements
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
      <div 
        ref={containerRef}
        className="max-w-7xl mx-auto text-center"
      >
        <div className="py-10">
          <div 
            data-animate
            className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6 opacity-0"
            style={{ animationDelay: "0.1s" }}
          >
            Now in beta — Limited spots available
          </div>
          
          <h1 
            data-animate
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-5xl mx-auto leading-tight opacity-0"
            style={{ animationDelay: "0.3s" }}
          >
            Instantly find and compare home service providers<span className="md:block md:mt-2">— without the hassle</span>
          </h1>
          
          <p 
            data-animate
            className="mt-6 text-xl text-foreground/70 max-w-2xl mx-auto opacity-0"
            style={{ animationDelay: "0.5s" }}
          >
            Describe your problem, upload photos, and get a list of pre-vetted providers with prices and reviews — delivered in minutes.
          </p>
          
          <div 
            data-animate
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0"
            style={{ animationDelay: "0.7s" }}
          >
            <a 
              href="#get-access"
              className="inline-flex items-center justify-center py-3 px-6 rounded-lg bg-primary text-primary-foreground font-medium shadow-subtle hover:shadow-medium transition-standard w-full sm:w-auto"
            >
              Get Early Access
            </a>
            <a 
              href="#how-it-works"
              className="inline-flex items-center justify-center py-3 px-6 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-standard w-full sm:w-auto"
            >
              See How It Works
            </a>
          </div>
        </div>
        
        <div 
          data-animate 
          className="mt-12 relative rounded-xl overflow-hidden shadow-medium max-w-5xl mx-auto opacity-0"
          style={{ animationDelay: "0.9s" }}
        >
          <div className="aspect-[16/9] bg-muted flex items-center justify-center">
            <div className="p-8 md:p-12 bg-white/95 rounded-lg backdrop-blur shadow-subtle text-center max-w-2xl">
              <h3 className="text-2xl font-semibold mb-4">Skip the phone calls and get quotes instantly</h3>
              <p className="text-foreground/70">Our AI automatically reaches out to the best service providers in your area and gets you quotes based on your needs.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
    </section>
  );
};

export default Hero;
