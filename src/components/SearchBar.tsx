import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { generateSearchSuggestions } from '@/lib/openai';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export const SearchBar = ({ 
  onSearch, 
  placeholder = "Ask AI about unfulfilled jobs to be done...",
  isLoading = false,
  disabled = false
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Generate suggestions when user types
    if (query.length >= 3) {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
      
      suggestionTimeoutRef.current = setTimeout(async () => {
        setIsGeneratingSuggestions(true);
        try {
          const newSuggestions = await generateSearchSuggestions(query);
          setSuggestions(newSuggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to generate suggestions:', error);
        } finally {
          setIsGeneratingSuggestions(false);
        }
      }, 500);
    } else {
      setShowSuggestions(false);
    }

    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
      setQuery(''); // Clear the search input after search
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const cleanSuggestion = suggestion.replace(/^[0-9]+\.\s*/, '').replace(/^[-*]\s*/, '');
    setQuery(cleanSuggestion);
    setShowSuggestions(false);
    // Ensure the input is updated before executing search
    setTimeout(() => {
      onSearch(cleanSuggestion);
    }, 0);
  };

  const exampleQueries = [
    "AI-powered customer service automation",
    "Sustainable transportation solutions for cities",
    "Mental health support for remote workers",
    "Small business financial management tools"
  ];

  return (
    <div className="relative max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-apple-gray h-5 w-5" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { setIsFocused(true); if (query.length >= 3) setShowSuggestions(true); }}
            onBlur={() => { setIsFocused(false); setTimeout(() => setShowSuggestions(false), 200); }}
            placeholder={disabled ? "Sign up to continue searching..." : placeholder}
            disabled={disabled}
            className="pl-12 pr-24 h-14 text-lg bg-white/80 backdrop-blur-sm border-0 shadow-apple rounded-2xl focus:shadow-hover transition-all duration-apple disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button
            type="submit"
            disabled={!query.trim() || isLoading || disabled}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6 bg-gradient-primary hover:opacity-90 transition-all duration-apple rounded-xl disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </form>

      {/* AI Suggestions Dropdown */}
      {isFocused && showSuggestions && (suggestions.length > 0 || isGeneratingSuggestions) && (
        <div
          className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-apple border border-gray-200 z-50"
          onMouseDown={e => e.preventDefault()}
        >
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">AI Suggestions</span>
            </div>
            
            {isGeneratingSuggestions ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Generating suggestions...
              </div>
            ) : (
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-2 rounded-lg hover:bg-blue-50 transition-colors text-sm text-gray-700 hover:text-blue-700"
                  >
                    {suggestion.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Example Queries */}
      {!query && !showSuggestions && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-3 text-center">Try these example searches:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(example);
                  onSearch(example);
                }}
                className="px-3 py-1 text-xs bg-white/60 hover:bg-white/80 rounded-full border border-gray-200 hover:border-blue-300 transition-all duration-200 text-gray-600 hover:text-blue-600"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};