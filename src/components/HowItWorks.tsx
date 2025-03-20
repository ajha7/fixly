import { useEffect, useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Describe your problem",
    description: "Simply tell us what needs fixing, add a few photos of the issue, and we'll take care of the rest."
  },
  {
    number: "02",
    title: "We find the best providers",
    description: "Our AI scours Nextdoor and other platforms to identify the most recommended local professionals."
  },
  {
    number: "03",
    title: "Get quotes automatically",
    description: "We contact providers directly and negotiate pricing based on your specific needs."
  },
  {
    number: "04",
    title: "Choose your provider",
    description: "Review quotes, ratings, and availability in one place. Select the best option for you."
  }
];

const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll("[data-animate]");
            elements.forEach((el, index) => {
              setTimeout(() => {
                el.classList.add("animate-fade-in");
                el.classList.remove("opacity-0");
              }, 200 * index);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

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
    <section id="how-it-works" className="py-20 md:py-28 px-6 bg-secondary/50">
      <div ref={containerRef} className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div data-animate className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4 opacity-0">
            Simple Process
          </div>
          <h2 data-animate className="text-3xl md:text-4xl font-bold tracking-tight opacity-0">
            How it works
          </h2>
          <p data-animate className="mt-4 text-xl text-foreground/70 max-w-2xl mx-auto opacity-0">
            We've simplified the process of finding and hiring home service providers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              data-animate
              className="bg-white rounded-xl p-6 shadow-subtle hover:shadow-medium transition-standard flex flex-col opacity-0"
            >
              <div className="text-primary font-semibold text-sm mb-4">{step.number}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-foreground/70 text-sm flex-grow">{step.description}</p>
              <div className="mt-4 h-1 w-12 bg-primary/20 rounded-full"></div>
            </div>
          ))}
        </div>

        <div data-animate className="mt-16 bg-white rounded-xl p-8 shadow-subtle opacity-0">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium mb-4">
                Time Saved
              </div>
              <h3 className="text-2xl font-semibold mb-3">Save hours of research and phone calls</h3>
              <p className="text-foreground/70">
                Our users save an average of 5 hours per home service request. No more calling multiple providers, waiting on hold, and explaining your problem over and over again.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-primary">87%</div>
                  <div className="text-sm text-foreground/70">Faster than traditional methods</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">94%</div>
                  <div className="text-sm text-foreground/70">User satisfaction rate</div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              <div className="rounded-lg bg-muted aspect-video flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div className="text-foreground font-medium">Video demo will appear here</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
