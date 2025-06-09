import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Menu, X, MoonIcon, SunIcon, Home, BookOpen, HelpCircle, Info, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [location] = useLocation();
  
  // TODO: Dark mode functionality temporarily disabled due to styling issues
  // Will be re-enabled once dark mode styles are properly implemented
  const [isDarkMode, setIsDarkMode] = useState(false); // Forced to light mode for now
  
  /* COMMENTED OUT: Dark mode functionality temporarily disabled
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Apply dark mode to document element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save to localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  */

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-100 via-blue-100 to-cyan-100 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900 relative">
      {/* Extended Background Gradient Overlay */}
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-teal-100/90 via-blue-100/80 to-cyan-100/90 dark:from-slate-900/90 dark:via-slate-800/80 dark:to-purple-900/90 -z-10" />
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-soft py-4 px-6 relative z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-xl sm:text-2xl text-foreground">Affirmation Studio</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/">
                <a className={`${location === '/' ? 'text-accent' : 'text-muted-foreground'} hover:text-accent transition-colors font-medium`}>
                  Create
                </a>
              </Link>
              <Link href="/library">
                <a className={`${location === '/library' ? 'text-accent' : 'text-muted-foreground'} hover:text-accent transition-colors font-medium`}>
                  Library
                </a>
              </Link>
              {/* COMMENTED OUT: Dark mode toggle temporarily disabled
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </Button>
              */}
            </nav>
            
            <img 
              src="/images/quietgrovelogo.png" 
              alt="Quiet Grove Logo" 
              className="h-8 w-auto"
            />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 py-4">
                <h2 className="text-lg font-semibold mb-2">Affirmation Studio</h2>
                <Link href="/">
                  <a className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent/10 hover:text-accent">
                    <Home className="w-5 h-5" />
                    <span>Create</span>
                  </a>
                </Link>
                <Link href="/library">
                  <a className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent/10 hover:text-accent">
                    <BookOpen className="w-5 h-5" />
                    <span>Library</span>
                  </a>
                </Link>
                {/* COMMENTED OUT: Dark mode toggle temporarily disabled
                <div className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent/10 hover:text-accent">
                  {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                  <button onClick={toggleDarkMode}>
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                  </button>
                </div>
                */}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 relative z-10">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-border py-6 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                  className="w-5 h-5 text-accent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8z"></path>
                  <path d="M8 9h8"></path>
                  <path d="M8 13h5"></path>
                  <path d="M12 7v6"></path>
                </svg>
                <span className="font-semibold text-lg text-foreground">Affirmation Studio</span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">Personalized meditations for mind and soul</p>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors flex items-center">
                <HelpCircle className="w-4 h-4 mr-1" /> Help
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors flex items-center">
                <Info className="w-4 h-4 mr-1" /> About
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors flex items-center">
                <Mail className="w-4 h-4 mr-1" /> Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
