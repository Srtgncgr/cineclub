'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, X, Loader2, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
  recentSearches?: string[];
  debounceMs?: number;
  showSuggestions?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
  disabled?: boolean;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const sizeStyles = {
  sm: {
    input: 'pl-10 pr-4 py-2 text-sm',
    icon: 'w-4 h-4 left-3',
    clearIcon: 'w-4 h-4 right-3'
  },
  md: {
    input: 'pl-12 pr-4 py-3 text-base',
    icon: 'w-5 h-5 left-4',
    clearIcon: 'w-5 h-5 right-4'
  },
  lg: {
    input: 'pl-14 pr-4 py-4 text-lg',
    icon: 'w-6 h-6 left-4',
    clearIcon: 'w-5 h-5 right-4'
  }
};

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Ara...",
  suggestions = [],
  recentSearches = [],
  debounceMs = 300,
  showSuggestions = true,
  className,
  size = 'md',
  autoFocus = false,
  disabled = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Debounced search value
  const debouncedSearchTerm = useDebounce(value, debounceMs);
  
  const styles = sizeStyles[size];

  // Typing timer to detect when user stops typing
  useEffect(() => {
    if (value.trim()) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, debounceMs);

      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [value, debounceMs]);

  // Search effect - triggers when debounced value changes
  // Note: Automatic search on debounce is disabled to prevent unwanted navigation
  // Search is only triggered on Enter key press or suggestion click
  useEffect(() => {
    // Only show loading state when typing, don't auto-trigger search
    if (debouncedSearchTerm && value.trim()) {
      setIsLoading(false); // Remove loading after debounce
    } else {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, value]);

  // Show loading when user is typing AND there's a query
  const shouldShowLoading = (isTyping || isLoading) && value.trim();

  // Filtered suggestions based on current input
  const filteredSuggestions = useMemo(() => {
    if (!value.trim() || !showSuggestions) return [];
    
    return suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(value.toLowerCase()) &&
      suggestion.toLowerCase() !== value.toLowerCase()
    ).slice(0, 5);
  }, [value, suggestions, showSuggestions]);

  // Show recent searches when input is focused but empty
  const showRecentSearches = useMemo(() => {
    return isFocused && !value.trim() && recentSearches.length > 0;
  }, [isFocused, value, recentSearches]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowDropdown(false);
    onSearch?.(suggestion);
  };

  const handleClear = () => {
    onChange('');
    setIsLoading(false);
    setIsTyping(false);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        onSearch?.(value.trim());
        setShowDropdown(false);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const shouldShowDropdown = showSuggestions && isFocused && showDropdown && 
    (filteredSuggestions.length > 0 || showRecentSearches);

  return (
    <div className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        {/* Search Icon */}
        <Search className={cn(
          'absolute top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none transition-opacity duration-200',
          styles.icon,
          shouldShowLoading && 'opacity-0'
        )} />

        {/* Loading Spinner */}
        <div className={cn(
          'absolute top-1/2 transform -translate-y-1/2 transition-opacity duration-200 pointer-events-none',
          styles.icon,
          shouldShowLoading ? 'opacity-100' : 'opacity-0'
        )}>
          <Loader2 className="w-full h-full text-primary animate-spin" />
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            setShowDropdown(true);
          }}
          onBlur={() => {
            // Delay hiding to allow suggestion clicks
            setTimeout(() => {
              setIsFocused(false);
              setShowDropdown(false);
            }, 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          className={cn(
            // Base styles that cannot be overridden
            'w-full rounded-xl transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30',
            'placeholder:text-gray-500',
            // Default background and border
            'bg-white border border-gray-300',
            styles.input,
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
          )}
          style={{ borderRadius: '0.75rem' }} // Force border-radius with inline style
        />

        {/* Clear Button */}
        {value && !disabled && (
          <button
            onClick={handleClear}
            className={cn(
              'absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors',
              styles.clearIcon
            )}
            type="button"
          >
            <X className="w-full h-full" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {shouldShowDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          
          {/* Recent Searches */}
          {showRecentSearches && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Son Aramalar</span>
              </div>
              <div className="space-y-1">
                {recentSearches.slice(0, 3).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtered Suggestions */}
          {filteredSuggestions.length > 0 && (
            <div className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Öneriler</span>
              </div>
              <div className="space-y-1">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-3 h-3 text-gray-400" />
                      <span>{suggestion}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {value.trim() && filteredSuggestions.length === 0 && !showRecentSearches && (
            <div className="p-4 text-center text-gray-500 text-sm">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p>"{value}" için öneri bulunamadı</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Hook for managing search state
export const useSearchInput = (initialValue = '', debounceMs = 300) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const debouncedQuery = useDebounce(searchQuery, debounceMs);

  const addToRecentSearches = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== query);
      return [query, ...filtered].slice(0, 10); // Keep last 10 searches
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    recentSearches,
    addToRecentSearches,
    clearRecentSearches
  };
};

export default SearchInput; 