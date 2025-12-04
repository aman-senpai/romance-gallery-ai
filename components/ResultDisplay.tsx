'use client';
import { Download, RefreshCw, Heart, Sparkles, Printer } from 'lucide-react';
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
}

export default function ResultDisplay({ profileImage, galleryImages, sourceImageFile, styleName, coupleName, category, onReset }: ResultDisplayProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [images, setImages] = useState<string[]>(galleryImages);
    const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await downloadZip(profileImage, images, sourceImageFile, styleName, coupleName);
        } catch (e) {
            console.error(e);
            alert('Failed to download ZIP');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleRegenerate = async (index: number) => {
        if (regeneratingIndex !== null) return;
        setRegeneratingIndex(index);

        try {
            const prompt = category.prompts[index];
            const formData = new FormData();
            formData.append('image', sourceImageFile);
            formData.append('style', category.name);
            formData.append('prompt', prompt);

            const result = await generateImage(formData);
            if (result.success && result.imageUrl) {
                const newImages = [...images];
                newImages[index] = result.imageUrl;
                setImages(newImages);
            }
        } catch (error) {
            console.error("Failed to regenerate image:", error);
        } finally {
            setRegeneratingIndex(null);
        }
    };

    return (
        <div className="flex flex-col items-center w-full animate-in fade-in duration-700 print:block print:w-full">

            {/* Profile Container */}
            <div className="w-full mb-8 relative print:mb-4">

                {/* Decorative Header Background */}
                <div className="h-48 bg-gradient-to-r from-kawaii-pink via-kawaii-purple to-kawaii-blue opacity-80 rounded-3xl print:h-32 print:opacity-50"></div>

                {/* Centered Profile Image */}
                <div className="relative -mt-24 flex flex-col items-center print:-mt-16">
                    <div className="w-48 h-48 rounded-full p-1 bg-white shadow-lg print:w-32 print:h-32">
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-kawaii-hot">
                            <img
                                src={profileImage}
                                alt="Generated Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="mt-4 text-center px-4">
                        <h2 className="text-3xl font-black text-gray-800 tracking-tight">
                            {coupleName ? `${coupleName}` : 'Lovers'}
                        </h2>
                        <p className="text-kawaii-hot font-bold mt-1 uppercase tracking-widest text-sm">{styleName}</p>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
                            ✨ A celebration of love, in {styleName} world.
                        </p>
                    </div>
                </div>

                {/* Gallery Grid */}
                <div className="mt-12 w-full px-8 md:px-16 print:mt-4 print:px-0">
                    <h3 className="text-center text-gray-400 font-bold text-xs tracking-[0.2em] mb-8 uppercase">Gallery Highlights</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
                        {images.map((img, idx) => {
                            const romanticMessages = [
                                "Love is in the air", "Two hearts, one soul", "Forever and always",
                                "A perfect match", "Written in the stars", "Endless love",
                                "Soulmates forever", "Pure magic", "Destiny calls"
                            ];
                            const message = romanticMessages[idx % romanticMessages.length];
                            const isRegenerating = regeneratingIndex === idx;

                            return (
                                <div key={idx} className="aspect-[4/5] relative group cursor-pointer overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 print:shadow-none print:border-gray-200 print:break-inside-avoid">
                                    <img src={img} alt={`Gallery ${idx}`} className={`w-full h-full object-cover transition duration-700 group-hover:scale-110 ${isRegenerating ? 'opacity-50 blur-sm' : ''}`} />

                                    {isRegenerating && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <RefreshCw className="animate-spin text-kawaii-hot" size={32} />
                                        </div>
                                    )}

                                    {!isRegenerating && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4 print:hidden">
                                            <div className="absolute top-4 right-4">
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
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-kawaii-hot text-white rounded-full font-bold shadow-lg hover:bg-pink-600 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDownloading ? (
                        <span className="animate-spin">⌛</span>
                    ) : (
                        <Download size={24} />
                    )}
                    {isDownloading ? 'Packaging Profile...' : 'Download Profile'}
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
