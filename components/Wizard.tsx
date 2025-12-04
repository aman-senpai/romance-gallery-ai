'use client';
import { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import StyleSelector from './StyleSelector';
import ResultDisplay from './ResultDisplay';
import { StyleCategory } from '@/lib/types';
import { generateImage } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';


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

    useEffect(() => {
        const shuffled = [...categories].sort(() => Math.random() - 0.5);
        setShuffledCategories(shuffled);
        if (shuffled.length > 0) {
            setSelectedCategory(shuffled[0].id);
        }
    }, [categories]);

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

        const galleryPrompts = category.prompts; // Should be 9 prompts
        const totalSteps = 1 + galleryPrompts.length; // 1 Profile + 9 Gallery
        let completedSteps = 0;

        try {
            // 1. Generate Profile Image
            const profilePrompt = "Create a Kawaii couple portrait of A and B. Intimate close-up framing, warm tones, romantic atmosphere perfect for celebration.";

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
            const galleryPromises = galleryPrompts.map(async (prompt) => {
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

            const results = await Promise.all(galleryPromises);
            const newGalleryImages = results.filter((url): url is string => url !== null);

            setGalleryImages(newGalleryImages);
            setStep('result');
        } catch (error) {
            console.error(error);
            alert('Generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col relative z-10 transition-all duration-500">
            <AnimatePresence mode="wait">
                {step === 'create' && (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 flex flex-col items-center w-full max-w-4xl mx-auto"
                    >
                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-extrabold text-gray-800 mb-4 tracking-tight">
                                Generate Gallery
                            </h2>
                            <p className="text-gray-500">Upload a photo and choose style to get started.</p>
                        </div>

                        <div className="w-full flex flex-col gap-8 items-center">
                            <ImageUploader onImageSelect={handleImageSelect} selectedImage={previewUrl} />

                            <div className="w-full max-w-md">
                                <label className="block text-gray-700 text-sm font-bold mb-2 text-center" htmlFor="coupleName">
                                    Couple Name
                                </label>
                                <input
                                    id="coupleName"
                                    type="text"
                                    placeholder="e.g. Romeo & Juliet"
                                    value={coupleName}
                                    onChange={(e) => setCoupleName(e.target.value)}
                                    className="shadow appearance-none border rounded-full w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center border-kawaii-pink focus:border-kawaii-hot transition-colors"
                                />
                            </div>

                            <div className="w-full">
                                <p className="text-center text-gray-600 font-bold mb-4">Choose Style</p>
                                <StyleSelector
                                    categories={shuffledCategories}
                                    selectedCategory={selectedCategory}
                                    onSelectCategory={setSelectedCategory}
                                />
                            </div>

                            {isGenerating ? (
                                <div className="w-full max-w-md mt-8">
                                    <div className="flex justify-between text-sm font-bold text-kawaii-hot mb-2">
                                        <span>Creating Magic...</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-kawaii-hot"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-center text-gray-400 mt-4 text-sm animate-pulse">This might take a moment...</p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleGenerate}
                                    disabled={!imageFile}
                                    className={`mt-4 flex items-center gap-2 px-12 py-5 rounded-full font-bold text-xl shadow-xl transition-all
                                        ${imageFile
                                            ? 'bg-kawaii-hot text-white hover:scale-105 hover:shadow-2xl cursor-pointer'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                >
                                    Generate Profile <Sparkles />
                                </button>
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
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
