'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

type SortOption = {
  value: string;
  label: string;
};

type SortFilterProps = {
  options: SortOption[];
  currentSortBy: string;
};

export default function SortFilter({ options, currentSortBy }: SortFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortBy = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', sortBy);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative">
      <select
        onChange={handleValueChange}
        value={currentSortBy}
        className="w-52 appearance-none cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 pr-8 text-gray-700 focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
} 