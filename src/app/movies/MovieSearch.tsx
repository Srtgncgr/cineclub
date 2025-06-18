'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useDebounce } from 'use-debounce';

export default function MovieSearch({ initialQuery }: { initialQuery?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [text, setText] = useState(initialQuery || '');
  const [query] = useDebounce(text, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('query', query);
    } else {
      params.delete('query');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [query, pathname, router, searchParams]);

  return (
    <div className="relative mb-4">
      <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Film, yönetmen veya oyuncu ara..."
        className="w-full pl-16 pr-6 py-5 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-lg shadow-sm"
      />
    </div>
  );
} 