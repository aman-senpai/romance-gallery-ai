'use client';
import { Download, RefreshCw, Heart, Sparkles, Printer, Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react';
import { downloadZip } from '@/lib/zip-utils';
import { useState } from 'react';
import { StyleCategory } from '@/lib/types';
import { generateImage } from '@/app/actions';

interface ResultDisplayProps {
    profileImage: string;
    galleryImages: string[];
    sourceImageFile: File;
    styleName: string;
    coupleName: string;
    category: StyleCategory;
    onReset: () => void;
    darkMode: boolean;
    onToggleDarkMode: () => void;
}

export default function ResultDisplay({ profileImage, galleryImages, sourceImageFile, styleName, coupleName, category, onReset, darkMode, onToggleDarkMode }: ResultDisplayProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    // Store history of images for each slot. Initial images are the first item in each slot's history.
    const [galleryHistory, setGalleryHistory] = useState<string[][]>(galleryImages.map(img => [img]));
    // Track which version is currently active for each slot
    const [currentIndices, setCurrentIndices] = useState<number[]>(new Array(galleryImages.length).fill(0));

    const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

    const themeColor = category.details?.theme?.color || (category.type === 'single' ? (category.gender === 'male' ? '#2563eb' : '#db2777') : '#ff0000');
    const dynamicStyle = {
        '--theme-color': themeColor,
        '--bg-color': !darkMode ? '#ffffff' : '#000000',
        '--text-color': !darkMode ? '#1f2937' : '#f3f4f6',
        '--card-bg': !darkMode ? '#ffffff' : '#171717',
        '--card-border': !darkMode ? '#f3f4f6' : '#262626',
    } as React.CSSProperties;
    const gradientClass = category.details?.theme?.gradient || 'from-kawaii-pink via-kawaii-purple to-kawaii-blue';
    const emojis = category.details?.theme?.emojis || ['✨', '💖', '🌸'];

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await downloadZip(profileImage, galleryHistory, currentIndices, sourceImageFile, styleName, coupleName);
        } catch (e) {
            console.error(e);
            alert('Failed to download ZIP');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSingleDownload = async (imageUrl: string, index: number) => {
        try {
            const blob = await (await fetch(imageUrl)).blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `couplai-${coupleName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${index + 1}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error("Failed to download image", e);
        }
    };

    const handleRegenerate = async (index: number) => {
        if (regeneratingIndex !== null) return;
        setRegeneratingIndex(index);

        try {
            const prompt = category.galleryPrompts[index];
            const formData = new FormData();
            formData.append('image', sourceImageFile);
            formData.append('style', category.name);
            formData.append('prompt', prompt);

            const result = await generateImage(formData);
            if (result.success && result.imageUrl) {
                setGalleryHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[index] = [...newHistory[index], result.imageUrl];
                    return newHistory;
                });
                setCurrentIndices(prev => {
                    const newIndices = [...prev];
                    newIndices[index] = galleryHistory[index].length; // Index of the new item (length before push + 1, effectively previous length)
                    return newIndices;
                });
            }
        } catch (error) {
            console.error("Failed to regenerate image:", error);
        } finally {
            setRegeneratingIndex(null);
        }
    };

    const navigateGallery = (galleryIndex: number, direction: 'prev' | 'next', e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndices(prev => {
            const newIndices = [...prev];
            const historyLen = galleryHistory[galleryIndex].length;
            if (direction === 'prev') {
                newIndices[galleryIndex] = (newIndices[galleryIndex] - 1 + historyLen) % historyLen;
            } else {
                newIndices[galleryIndex] = (newIndices[galleryIndex] + 1) % historyLen;
            }
            return newIndices;
        });
    };

    return (
        <div className="flex flex-col items-center w-full animate-in fade-in duration-700 print:block print:w-full transition-colors duration-500" style={{ ...dynamicStyle, backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>

            {/* Profile Container */}
            <div className="w-full mb-8 relative print:mb-4">

                {/* Decorative Header Background */}
                <div className={`h-48 bg-gradient-to-r ${gradientClass} opacity-80 rounded-3xl print:h-32 print:opacity-50`}></div>

                {/* Centered Profile Image */}
                <div className="relative -mt-24 flex flex-col items-center print:-mt-16">
                    <div className="w-48 h-48 rounded-full p-1 bg-white shadow-lg print:w-32 print:h-32" style={{ backgroundColor: 'var(--card-bg)' }}>
                        <div className={`w-full h-full rounded-full overflow-hidden border-4 border-[var(--theme-color)]`}>
                            <img
                                src={profileImage}
                                alt="Generated Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="mt-4 text-center px-4">
                        <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-color)' }}>
                            {coupleName ? `${coupleName}` : (category.type === 'single' ? 'Star' : 'Lovers')}
                        </h2>
                        <p className={`text-[var(--theme-color)] font-bold mt-1 uppercase tracking-widest text-sm`}>{styleName}</p>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
                            {category.type === 'single'
                                ? `✨ A royal portrait, in ${styleName} world.`
                                : `✨ A celebration of love, in ${styleName} world.`}
                        </p>
                    </div>
                </div>

                {/* Gallery Grid */}
                <div className="mt-12 w-full px-8 md:px-16 print:mt-4 print:px-0">
                    <h3 className="text-center text-gray-400 font-bold text-xs tracking-[0.2em] mb-8 uppercase">Gallery Highlights</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
                        {galleryHistory.map((history, idx) => {
                            const currentIndex = currentIndices[idx];
                            const img = history[currentIndex];

                            const isSolo = category.type === 'single';
                            const messages = isSolo ? [
                                "Pure elegance", "Royal vibes", "Simply magical",
                                "Shining bright", "Dream come true", "Timeless beauty",
                                "Enchanted moment", "Star power", "Legendary look"
                            ] : [
                                "Love is in the air", "Two hearts, one soul", "Forever and always",
                                "A perfect match", "Written in the stars", "Endless love",
                                "Soulmates forever", "Pure magic", "Destiny calls"
                            ];
                            const message = messages[idx % messages.length];
                            const isRegenerating = regeneratingIndex === idx;

                            return (
                                <div key={idx} className="aspect-[4/5] relative group cursor-pointer overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 print:shadow-none print:border-gray-200 print:break-inside-avoid" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                    <img src={img} alt={`Gallery ${idx}`} className={`w-full h-full object-cover transition duration-700 group-hover:scale-110 ${isRegenerating ? 'opacity-50 blur-sm' : ''}`} />

                                    {isRegenerating && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <RefreshCw className="animate-spin text-kawaii-hot" size={32} />
                                        </div>
                                    )}

                                    {!isRegenerating && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4 print:hidden">
                                            {/* Navigation Arrows */}
                                            {history.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={(e) => navigateGallery(idx, 'prev', e)}
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full backdrop-blur-sm transition-all hover:scale-110"
                                                    >
                                                        <ChevronLeft size={24} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => navigateGallery(idx, 'next', e)}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full backdrop-blur-sm transition-all hover:scale-110"
                                                    >
                                                        <ChevronRight size={24} />
                                                    </button>

                                                    {/* Version Indicator */}
                                                    <div className="absolute top-2 left-2 bg-black/40 text-white text-xs px-2 py-1 rounded-full backdrop-blur-md">
                                                        {currentIndex + 1}/{history.length}
                                                    </div>
                                                </>
                                            )}

                                            {/* Floating Emoji */}
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:-translate-y-16 pointer-events-none">
                                                <span className="text-6xl filter drop-shadow-lg animate-bounce">{emojis[idx % emojis.length]}</span>
                                            </div>

                                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSingleDownload(img, idx);
                                                    }}
                                                    className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all hover:scale-110"
                                                    title="Download this image"
                                                >
                                                    <Download size={20} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRegenerate(idx);
                                                    }}
                                                    className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all hover:rotate-180"
                                                    title="Regenerate this image"
                                                >
                                                    <RefreshCw size={20} />
                                                </button>
                                            </div>
                                            <div className="text-white font-bold flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition duration-300 text-center w-full">
                                                <Heart fill="white" size={16} />
                                                <span className="text-sm italic">{message}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pb-12 print:hidden">
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={`flex items-center justify-center gap-2 px-8 py-4 bg-[var(--theme-color)] text-white rounded-full font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isDownloading ? (
                        <span className="animate-spin">⌛</span>
                    ) : (
                        <Download size={24} />
                    )}
                    {isDownloading ? 'Packaging Profile...' : 'Download Profile'}
                </button>
                <button
                    onClick={onToggleDarkMode}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-gray-600 rounded-full font-bold shadow-md hover:bg-gray-50 hover:scale-105 transition-all"
                    style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                >
                    {!darkMode ? <Moon size={24} /> : <Sun size={24} />}
                </button>
                <button
                    onClick={onReset}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-600 rounded-full font-bold shadow-md hover:bg-gray-50 hover:scale-105 transition-all"
                >
                    <RefreshCw size={24} />
                    Try New Style
                </button>
                <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-600 rounded-full font-bold shadow-md hover:bg-gray-50 hover:scale-105 transition-all"
                >
                    <Printer size={24} />
                    Print Gallery
                </button>
            </div>
        </div>
    );
}
