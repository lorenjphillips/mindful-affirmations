import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface TemplateCardProps {
  template: {
    id: string;
    title: string;
    purpose: string;
    duration: number;
    backgroundMusic: string;
    popularity: number;
  };
  onSelect: () => void;
}

export default function TemplateCard({ template, onSelect }: TemplateCardProps) {
  // Background images based on purpose
  const getBgImage = (purpose: string) => {
    switch (purpose) {
      case 'sleep':
        return 'bg-gradient-to-r from-blue-900 to-indigo-900';
      case 'morning':
        return 'bg-gradient-to-r from-orange-400 to-amber-500';
      case 'focus':
        return 'bg-gradient-to-r from-sky-500 to-blue-600';
      case 'confidence':
        return 'bg-gradient-to-r from-purple-500 to-pink-600';
      case 'stress':
        return 'bg-gradient-to-r from-green-500 to-teal-500';
      case 'meeting':
        return 'bg-gradient-to-r from-slate-600 to-gray-700';
      default:
        return 'bg-gradient-to-r from-accent to-accent-dark';
    }
  };

  // Get SVG based on purpose 
  const getPurposeIcon = (purpose: string) => {
    switch (purpose) {
      case 'sleep':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            className="w-16 h-16 text-white/70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        );
      case 'morning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            className="w-16 h-16 text-white/70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        );
      case 'focus':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            className="w-16 h-16 text-white/70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        );
      case 'confidence':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            className="w-16 h-16 text-white/70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        );
      case 'stress':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            className="w-16 h-16 text-white/70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" x2="9.01" y1="9" y2="9" />
            <line x1="15" x2="15.01" y1="9" y2="9" />
          </svg>
        );
      case 'meeting':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            className="w-16 h-16 text-white/70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8h-3" />
            <path d="M17 21v-8h-8" />
            <path d="M13 7V3h8v8h-4" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            className="w-16 h-16 text-white/70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8z" />
            <path d="M8 9h8" />
            <path d="M8 13h5" />
            <path d="M12 7v6" />
          </svg>
        );
    }
  };

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-medium transition-shadow">
      <div className={`h-36 flex items-center justify-center ${getBgImage(template.purpose)}`}>
        {getPurposeIcon(template.purpose)}
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold">{template.title}</h4>
        <p className="text-neutral-600 text-sm mb-2">{template.duration} minutes • {template.backgroundMusic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
        <div className="flex items-center text-sm">
          <Heart className="h-4 w-4 text-accent mr-2" />
          <span className="text-neutral-500">{template.popularity} users love this</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="ghost" className="w-full text-accent hover:bg-accent/10" onClick={onSelect}>
          Use this template
        </Button>
      </CardFooter>
    </Card>
  );
}
