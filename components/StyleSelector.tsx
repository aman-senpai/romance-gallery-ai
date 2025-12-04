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
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 border-2
            ${selectedCategory === cat.id
                            ? 'bg-kawaii-hot border-kawaii-hot text-white shadow-lg shadow-kawaii-hot/30'
                            : 'bg-white border-kawaii-pink/30 text-gray-600 hover:border-kawaii-hot/50 hover:text-kawaii-hot'}`}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
}
