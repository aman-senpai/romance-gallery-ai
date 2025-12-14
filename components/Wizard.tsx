'use client';
import { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import StyleSelector from './StyleSelector';
import ResultDisplay from './ResultDisplay';
import { StyleCategory } from '@/lib/types';
import { generateImage } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, ArrowLeft, Sun, Moon, User, Users } from 'lucide-react';
import AestheticOverlay from './AestheticOverlay';


interface WizardProps {
    categories: StyleCategory[];
}

export default function Wizard({ categories }: WizardProps) {
    const [shuffledCategories, setShuffledCategories] = useState<StyleCategory[]>([]);
    const [step, setStep] = useState<'create' | 'result'>('create');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Theme & Mode State
    const [mode, setMode] = useState<'couple' | 'single'>('single');
    const [darkMode, setDarkMode] = useState(false);

    // Toggle Dark Mode
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Filter categories based on mode
    useEffect(() => {
        const filtered = categories.filter(c => {
            const isSolo = c.type === 'single';
            return mode === 'single' ? isSolo : !isSolo;
        });
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        setShuffledCategories(shuffled);

        if (shuffled.length > 0) {
            setSelectedCategory(shuffled[0].id);
        } else {
            setSelectedCategory('');
        }
    }, [categories, mode]);

    const [profileImage, setProfileImage] = useState<string>('');
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);

    const [coupleName, setCoupleName] = useState<string>('');

    const handleImageSelect = (file: File | null, url: string) => {
        setImageFile(file);
        setPreviewUrl(url);
    };

    const handleGenerate = async () => {
        if (!imageFile) return;
        const category = shuffledCategories.find(c => c.id === selectedCategory);
        if (!category) return;

        setIsGenerating(true);
        setProfileImage('');
        setGalleryImages([]);
        setProgress(0);

        const galleryPrompts = category.galleryPrompts; // Should be 9 prompts
        const totalSteps = 1 + galleryPrompts.length; // 1 Profile + 9 Gallery
        let completedSteps = 0;

        try {
            // 1. Generate Profile Image
            const profilePrompt = category.profilePrompt;

            const profileFormData = new FormData();
            profileFormData.append('image', imageFile);
            profileFormData.append('style', "Kawaii Profile"); // Use a generic style name or the selected one? User said "use this prompt".
            profileFormData.append('prompt', profilePrompt);

            const profileResult = await generateImage(profileFormData);
            if (profileResult.success && profileResult.imageUrl) {
                setProfileImage(profileResult.imageUrl);
            }
            completedSteps++;
            setProgress((completedSteps / totalSteps) * 100);

            // 2. Generate Gallery Images
            const batchSize = 2;
            const newGalleryImages: string[] = [];

            for (let i = 0; i < galleryPrompts.length; i += batchSize) {
                const batch = galleryPrompts.slice(i, i + batchSize);

                const batchPromises = batch.map(async (prompt: string) => {
                    const formData = new FormData();
                    formData.append('image', imageFile);
                    formData.append('style', category.name);
                    formData.append('prompt', prompt);

                    try {
                        const result = await generateImage(formData);
                        completedSteps++;
                        setProgress((completedSteps / totalSteps) * 100);

                        if (result.success && result.imageUrl) {
                            return result.imageUrl;
                        }
                    } catch (error) {
                        console.error("Failed to generate gallery image:", error);
                    }
                    return null;
                });

                const results = await Promise.all(batchPromises);
                const validResults = results.filter((url): url is string => url !== null);
                newGalleryImages.push(...validResults);

                // Update gallery images progressively so user sees something happening
                setGalleryImages(prev => [...prev, ...validResults]);

                // Add delay between batches if not the last batch
                if (i + batchSize < galleryPrompts.length) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
                }
            }

            setStep('result');
        } catch (error) {
            console.error(error);
            alert('Generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const selectedCategoryData = categories.find(c => c.id === selectedCategory);
    const currentThemeColor = selectedCategoryData?.details?.theme?.color || (mode === 'single' ? '#3b82f6' : '#ec4899'); // Default Blue for Single, Pink for Couple

    // Theme style for dynamic color
    const themeStyle = { '--theme-color': currentThemeColor } as React.CSSProperties;

    return (
        <div className="w-full h-full flex flex-col relative z-10 transition-all duration-500" style={themeStyle}>
            <AestheticOverlay mode={mode} emojis={selectedCategoryData?.details?.theme?.emojis} />
            <AnimatePresence mode="wait">
                {step === 'create' && (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}

                        className="flex-1 flex flex-col items-center w-full max-w-4xl mx-auto"
                    >
                        {/* Controls Header */}
                        <div className="w-full flex justify-between items-center px-4 mb-2">
                            <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-full shadow-inner">
                                <button
                                    onClick={() => setMode('single')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === 'single'
                                        ? 'bg-[var(--theme-color)] text-white shadow-md'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    <User size={16} /> Single
                                </button>
                                <button
                                    onClick={() => setMode('couple')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === 'couple'
                                        ? 'bg-[var(--theme-color)] text-white shadow-md'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    <Users size={16} /> Couple
                                </button>
                            </div>

                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-yellow-400"
                            >
                                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </div>
                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-4 tracking-tight">
                                {selectedCategoryData?.title || (mode === 'single' ? 'Create Your Legacy' : 'Generate Gallery')}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-300">
                                {selectedCategoryData?.subtitle || (mode === 'single' ? 'Upload a selfie and become royalty.' : 'Upload a photo and choose style to get started.')}
                            </p>
                        </div>

                        <div className="w-full flex flex-col gap-8 items-center">
                            <ImageUploader onImageSelect={handleImageSelect} selectedImage={previewUrl} themeColor={currentThemeColor} />

                            <div className="w-full max-w-md">
                                <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2 text-center" htmlFor="coupleName">
                                    {selectedCategory && categories.find(c => c.id === selectedCategory)?.type === 'single' ? 'Your Name' : 'Couple Name'}
                                </label>
                                <input
                                    id="coupleName"
                                    type="text"
                                    placeholder={
                                        selectedCategory === 'prince' ? 'e.g. Prince Charming' :
                                            selectedCategory === 'princess' ? 'e.g. Cinderella' :
                                                selectedCategory && categories.find(c => c.id === selectedCategory)?.type === 'single' ? 'e.g. Your Name' :
                                                    'e.g. Romeo & Juliet'
                                    }
                                    value={coupleName}
                                    onChange={(e) => setCoupleName(e.target.value)}
                                    className="shadow appearance-none border-2 rounded-full w-full py-3 px-4 text-gray-700 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center border-gray-300 focus:border-[var(--theme-color)] transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>

                            <div className="w-full min-h-[160px]">
                                <p className="text-center text-gray-600 dark:text-gray-300 font-bold mb-4">Choose Style</p>
                                <StyleSelector
                                    categories={shuffledCategories}
                                    selectedCategory={selectedCategory}
                                    onSelectCategory={setSelectedCategory}
                                />
                            </div>

                            {isGenerating ? (
                                <div className="w-full max-w-md mt-8">
                                    {/* Dynamic Color for Progress */}
                                    {(() => {
                                        const category = categories.find(c => c.id === selectedCategory);
                                        const themeColor = category?.details?.theme?.color || (category?.gender === 'male' ? '#3b82f6' : '#ec4899');
                                        const style = { '--theme-color': themeColor } as React.CSSProperties;
                                        const colorClass = `text-[var(--theme-color)]`;
                                        const bgClass = `bg-[var(--theme-color)]`;

                                        return (
                                            <>
                                                <div style={style}>
                                                    <div className={`flex justify-between text-sm font-bold ${colorClass} mb-2`}>
                                                        <span>Creating Magic...</span>
                                                        <span>{Math.round(progress)}%</span>
                                                    </div>
                                                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className={`h-full ${bgClass}`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                    <p className="text-center text-gray-400 dark:text-gray-500 mt-4 text-sm animate-pulse">This might take a moment...</p>
                                </div>
                            ) : (
                                (() => {
                                    const category = categories.find(c => c.id === selectedCategory);
                                    const themeColor = category?.details?.theme?.color || (category?.gender === 'male' ? '#3b82f6' : '#ec4899');
                                    const style = { '--theme-color': themeColor } as React.CSSProperties;
                                    const isReady = imageFile && coupleName.trim().length > 0;

                                    const buttonClass = isReady
                                        ? `bg-[var(--theme-color)] hover:brightness-110 text-white hover:scale-105 hover:shadow-2xl cursor-pointer`
                                        : 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-600 cursor-not-allowed';

                                    return (
                                        <button
                                            onClick={handleGenerate}
                                            disabled={!isReady}
                                            style={isReady ? style : {}}
                                            className={`mt-4 flex items-center gap-2 px-12 py-5 rounded-full font-bold text-xl shadow-xl transition-all ${buttonClass}`}
                                        >
                                            Generate Profile <Sparkles />
                                        </button>
                                    );
                                })()
                            )}
                        </div>
                    </motion.div>
                )}

                {step === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 w-full"
                    >
                        <ResultDisplay
                            profileImage={profileImage}
                            galleryImages={galleryImages}
                            sourceImageFile={imageFile!}
                            styleName={shuffledCategories.find(c => c.id === selectedCategory)?.name || ''}
                            coupleName={coupleName}
                            category={shuffledCategories.find(c => c.id === selectedCategory)!}
                            onReset={() => {
                                setStep('create');
                                setImageFile(null);
                                setPreviewUrl(null);
                                setProfileImage('');
                                setGalleryImages([]);
                                setCoupleName('');
                            }}
                            darkMode={darkMode}
                            onToggleDarkMode={() => setDarkMode(!darkMode)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
