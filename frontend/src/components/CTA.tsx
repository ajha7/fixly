
import { useState } from "react";
import { cn } from "@/lib/utils";

const CTA = () => {
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !validateEmail(email)) {
      setIsValid(false);
      return;
    }
    
    setIsValid(true);
    console.log("Email submitted:", email);
    setIsSubmitted(true);
    
    // Reset form after submission
    setTimeout(() => {
      setEmail("");
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <section id="get-access" className="py-20 md:py-28 px-6 bg-gradient-to-b from-white to-secondary/30">
      <div className="max-w-4xl mx-auto text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            Limited Time Offer
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Get early access today
          </h2>
          <p className="mt-4 text-xl text-foreground/70 max-w-2xl mx-auto">
            Be among the first to experience our home service provider matching platform at exclusive early adopter rates.
          </p>

          <div className="mt-10 max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
              <div className="w-full mb-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsValid(true);
                    }}
                    placeholder="Enter your email"
                    className={cn(
                      "w-full py-3 px-4 pr-12 rounded-lg border bg-white transition-standard",
                      isValid 
                        ? "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                        : "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                    )}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {email && (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className={isValid ? "text-primary" : "text-destructive"}
                      >
                        <path d="M22 2L11 13"></path>
                        <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                      </svg>
                    )}
                  </div>
                </div>
                {!isValid && (
                  <p className="mt-1 text-sm text-destructive text-left">
                    Please enter a valid email address
                  </p>
                )}
              </div>

              <button
                type="submit"
                className={cn(
                  "w-full py-3 px-6 rounded-lg bg-primary text-primary-foreground font-medium shadow-subtle hover:shadow-medium transition-standard",
                  isSubmitted && "bg-green-600"
                )}
                disabled={isSubmitted}
              >
                {isSubmitted ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
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
                    <span>Thanks! You're on the list</span>
                  </span>
                ) : (
                  "Get Early Access"
                )}
              </button>
            </form>
            
            <p className="mt-3 text-sm text-foreground/60">
              We'll notify you as soon as access is available
            </p>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-white shadow-subtle flex items-center justify-center mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-medium">100% Secure</h3>
                <p className="text-sm text-foreground/60">Your data is protected</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-white shadow-subtle flex items-center justify-center mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-medium">Cancel Anytime</h3>
                <p className="text-sm text-foreground/60">No commitment required</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
