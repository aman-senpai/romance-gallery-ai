'use client';
import { StyleCategory } from '@/lib/types';

interface StyleSelectorProps {
    categories: StyleCategory[];
    selectedCategory: string;
    onSelectCategory: (id: string) => void;
}

export default function StyleSelector({ categories, selectedCategory, onSelectCategory }: StyleSelectorProps) {
    return (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
            {categories.map((cat) => {
                const themeColor = cat.details?.theme?.color || (cat.gender === 'male' ? '#3b82f6' : '#ec4899');

                return (
                    <button
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.id)}
                        style={{ '--theme-color': themeColor } as React.CSSProperties}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 border-2
            ${selectedCategory === cat.id
                                ? 'bg-[var(--theme-color)] border-[var(--theme-color)] text-white shadow-lg shadow-[var(--theme-color)]/30'
                                : 'bg-gray-100 dark:bg-gray-800 border-kawaii-pink/50 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[var(--theme-color)]/50 hover:text-[var(--theme-color)]'}`}
                    >
                        {cat.name}
                    </button>
                )
            })}
        </div>
    );
}
