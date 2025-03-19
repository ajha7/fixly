import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type PricingTier = {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
};

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "Beta Waitlist",
    description: "Join our waitlist to be among the first to try our service",
    features: [
      "Access to beta features",
      "Limited service providers",
      "Basic search functionality",
      "Email support"
    ],
    cta: "Join Waitlist"
  },
  {
    name: "Standard",
    price: "$2.99",
    description: "One-time concierge service for a single home service need",
    features: [
      "One service request",
      "5+ provider quotes",
      "Provider verification",
      "24-hour delivery",
      "Priority email support"
    ],
    cta: "Get Started",
    popular: true
  },
  {
    name: "Premium",
    price: "$15.99/mo",
    description: "Unlimited requests for all your home service needs",
    features: [
      "Unlimited service requests",
      "10+ provider quotes per request",
      "Provider verification",
      "Same-day delivery when available",
      "Priority phone support",
      "Exclusive provider discounts",
      "Early access to new features"
    ],
    cta: "Get Early Access"
  }
];

const Pricing = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTier, setSelectedTier] = useState<number>(1);
  
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
              }, 150 * index);
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
    <section id="pricing" className="py-20 md:py-28 px-6">
      <div ref={containerRef} className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div data-animate className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4 opacity-0">
            Early Access Pricing
          </div>
          <h2 data-animate className="text-3xl md:text-4xl font-bold tracking-tight opacity-0">
            Simple, transparent pricing
          </h2>
          <p data-animate className="mt-4 text-xl text-foreground/70 max-w-2xl mx-auto opacity-0">
            Choose the plan that works best for your home service needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.name}
              data-animate
              className={cn(
                "bg-white rounded-xl overflow-hidden transition-standard opacity-0",
                selectedTier === index 
                  ? "ring-2 ring-primary shadow-medium transform scale-[1.02]" 
                  : "shadow-subtle hover:shadow-medium"
              )}
              onClick={() => setSelectedTier(index)}
            >
              <div className="p-6 md:p-8">
                {tier.popular && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold">{tier.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  {tier.price.includes('/') && <span className="text-foreground/70 ml-1">per month</span>}
                </div>
                <p className="text-foreground/70 text-sm mb-6">{tier.description}</p>
                
                <div className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start">
                      <svg 
                        className="w-5 h-5 text-primary mt-0.5 mr-3" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  className={cn(
                    "w-full py-3 px-4 rounded-lg font-medium transition-standard",
                    selectedTier === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  )}
                >
                  {tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div data-animate className="mt-16 text-center max-w-3xl mx-auto opacity-0">
          <div className="bg-secondary/70 rounded-xl p-6 md:p-8">
            <h3 className="text-xl font-semibold mb-2">Early Adopter Special Offer</h3>
            <p className="text-foreground/70 mb-4">
              Sign up for our Premium plan now and lock in the $15.99/month price forever, even after we increase our regular pricing.
            </p>
            <div className="inline-flex items-center bg-white/80 px-4 py-2 rounded-lg text-sm">
              <span className="text-foreground/70 mr-2">Use code:</span>
              <span className="font-mono font-semibold">EARLYACCESS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
