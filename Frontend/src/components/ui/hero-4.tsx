import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: React.ReactNode;
  animatedTexts: string[];
  subtitle: string;
  infoBadgeText: string;
  ctaButtonText: string;
  socialProofText: string;
  avatars: {
    src: string;
    alt: string;
    fallback: string;
  }[];
  onCtaClick?: () => void;
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  ({ className, title, animatedTexts, subtitle, infoBadgeText, ctaButtonText, socialProofText, avatars, onCtaClick, ...props }, ref) => {
    const [textIndex, setTextIndex] = React.useState(0);
    const [displayText, setDisplayText] = React.useState("");
    const [isDeleting, setIsDeleting] = React.useState(false);

    React.useEffect(() => {
      const fullText = animatedTexts[textIndex];

      const handleTyping = () => {
        if (isDeleting) {
          setDisplayText((prev) => prev.substring(0, prev.length - 1));
        } else {
          setDisplayText((prev) => fullText.substring(0, prev.length + 1));
        }
      };

      const typingSpeed = isDeleting ? 75 : 150;
      const typeInterval = setInterval(handleTyping, typingSpeed);

      if (!isDeleting && displayText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % animatedTexts.length);
      }

      return () => clearInterval(typeInterval);
    }, [displayText, isDeleting, textIndex, animatedTexts]);

    return (
      <section
        className={cn("container mx-auto flex flex-col items-center justify-center text-center py-20 md:py-28", className)}
        ref={ref}
        {...props}
      >
        <div className="max-w-4xl animate-slide-up">
          {/* Info Badge */}
          <div className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6 border border-border">
            {infoBadgeText}
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            {title}
            <span className="relative mt-4 block w-fit mx-auto">
              {/* Dashed border effect */}
              <span className="absolute inset-0 -z-10 -m-3">
                <span className="absolute inset-0 border-2 border-dashed border-primary rounded-2xl opacity-60"></span>
              </span>
              {/* Animated Text */}
              <span className="text-primary min-h-[1.2em] inline-block px-4">
                {displayText}
                <span className="animate-pulse">|</span>
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-8 text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto font-medium">
            {subtitle}
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-6 animate-slide-up delay-150">
          {/* CTA Button */}
          <Button size="lg" onClick={onCtaClick} className="px-10 py-7 text-lg font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            {ctaButtonText}
          </Button>

          {/* Social Proof */}
          <div className="mt-4 flex items-center justify-center">
            <div className="flex -space-x-3">
              {avatars.map((avatar, index) => (
                <Avatar key={index} className="border-2 border-background w-10 h-10 shadow-md">
                  <AvatarImage src={avatar.src} alt={avatar.alt} />
                  <AvatarFallback>{avatar.fallback}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <p className="ml-4 text-sm font-semibold text-muted-foreground">
              {socialProofText}
            </p>
          </div>
        </div>
      </section>
    );
  }
);

HeroSection.displayName = "HeroSection";

export { HeroSection };
