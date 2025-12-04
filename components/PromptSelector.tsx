'use client';
import { motion } from 'framer-motion';

interface PromptSelectorProps {
    prompts: string[];
    selectedPrompt: string;
    onSelectPrompt: (prompt: string) => void;
}

export default function PromptSelector({ prompts, selectedPrompt, onSelectPrompt }: PromptSelectorProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2 custom-scrollbar">
            {prompts.map((prompt, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => onSelectPrompt(prompt)}
                    className={`p-4 rounded-xl cursor-pointer border-2 transition-all relative overflow-hidden
            ${selectedPrompt === prompt
                            ? 'border-kawaii-hot bg-kawaii-pink/10 shadow-md transform scale-[1.02]'
                            : 'border-transparent bg-white/60 hover:border-kawaii-blue/30 hover:bg-white'}`}
                >
                    <p className="text-sm text-gray-700 leading-relaxed">{prompt}</p>
                    {selectedPrompt === prompt && (
                        <div className="absolute top-2 right-2 text-kawaii-hot">
                            ❤️
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
