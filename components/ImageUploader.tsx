'use client';
import { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploaderProps {
    onImageSelect: (file: File | null, previewUrl: string) => void;
    selectedImage: string | null;
}

export default function ImageUploader({ onImageSelect, selectedImage }: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) return;
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
        <div className="w-full max-w-md mx-auto">
            {selectedImage ? (
                <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-kawaii-pink/50 group">
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
                    className={`border-4 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer bg-white/50 backdrop-blur-sm h-64
            ${isDragging ? 'border-blue-500 bg-blue-50 scale-105' : 'border-kawaii-blue/50 hover:border-kawaii-blue hover:bg-kawaii-blue/10'}`}
                >
                    <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                        <Upload size={48} className="text-kawaii-blue mb-4 animate-bounce" />
                        <span className="text-gray-600 font-medium text-lg">Upload Couple Photo</span>
                        <span className="text-gray-400 text-sm mt-2">Drag & drop or click to browse</span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        />
                    </label>
                </div>
            )}
        </div>
    );
}
