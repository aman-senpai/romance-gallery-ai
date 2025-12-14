'use client';
import { useState, useCallback } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploaderProps {
    onImageSelect: (file: File | null, previewUrl: string) => void;
    selectedImage: string | null;
    themeColor?: string;
}

export default function ImageUploader({ onImageSelect, selectedImage, themeColor = '#3b82f6' }: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const style = { '--theme-color': themeColor } as React.CSSProperties;

    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) return;

        // Check file size (1MB = 1048576 bytes)
        if (file.size > 1 * 1024 * 1024) {
            setError("The image is too large! Please choose an image smaller than 1MB.");
            return;
        }

        setError(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            onImageSelect(file, e.target?.result as string);
        };
        reader.readAsDataURL(file);
    }, [onImageSelect]);

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto relative" style={style}>
            {/* Error Modal */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center border-4 border-red-200 dark:border-red-900">
                            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
                                <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Image Too Large</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Oops! That image is a bit heavy. Please upload a photo smaller than <span className="font-bold text-kawaii-hot">1MB</span> to continue the magic.
                            </p>
                            <button
                                onClick={() => setError(null)}
                                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform"
                            >
                                Okay, I'll fix it!
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedImage ? (
                <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-[var(--theme-color)] group">
                    <img src={selectedImage} alt="Preview" className="w-full h-auto" />
                    <button
                        onClick={() => onImageSelect(null, '')}
                        className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-kawaii-hot hover:bg-white transition-colors shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>
            ) : (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    className={`border-4 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm h-64
            ${isDragging ? 'border-[var(--theme-color)] bg-blue-50 dark:bg-blue-900/20 scale-105' : 'border-[var(--theme-color)]/50 dark:border-[var(--theme-color)]/50 hover:border-[var(--theme-color)] hover:dark:border-[var(--theme-color)] hover:bg-neutral-50 dark:hover:bg-neutral-900/30'}`}
                >
                    <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                        <Upload size={48} className="text-[var(--theme-color)] dark:text-[var(--theme-color)] mb-4 animate-bounce" />
                        <span className="text-gray-800 dark:text-gray-200 font-medium text-lg">Upload Photo</span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm mt-2">Drag & drop or click to browse</span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        />
                    </label>
                </div>
            )
            }
        </div >
    );
}
