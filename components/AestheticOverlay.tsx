'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AestheticOverlayProps {
    mode: 'couple' | 'single';
    emojis?: string[];
}

export default function AestheticOverlay({ mode, emojis }: AestheticOverlayProps) {
    const [elements, setElements] = useState<{ id: number; x: number; y: number; type: string }[]>([]);

    useEffect(() => {
        let types: string[];
        if (emojis && emojis.length > 0) {
            types = emojis;
        } else {
            types = mode === 'couple' ? ['sparkle', 'petal', 'heart'] : ['star', 'crown', 'diamond'];
        }

        const newElements = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            type: types[Math.floor(Math.random() * types.length)],
        }));
        setElements(newElements);
    }, [mode, emojis]);

    const getIcon = (type: string) => {
        if (emojis && emojis.includes(type)) return type;

        switch (type) {
            case 'sparkle': return '✨';
            case 'petal': return '🌸';
            case 'star': return '⭐';
            case 'crown': return '👑';
            case 'diamond': return '💎';
            default: return '✨';
        }
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {elements.map((el) => (
                <motion.div
                    key={`${el.id}-${mode}`}
                    className={`absolute text-2xl md:text-4xl drop-shadow-sm ${emojis ? '' : (mode === 'single' ? 'text-blue-400' : 'text-kawaii-hot')}`}
                    style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                    }}
                    animate={{
                        y: [0, -50, 0],
                        opacity: [0, 0.6, 0],
                        scale: [0.5, 1, 0.5],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 5 + Math.random() * 5,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "easeInOut"
                    }}
                >
                    {getIcon(el.type)}
                </motion.div>
            ))}
        </div>
    );
}
