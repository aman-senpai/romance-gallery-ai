'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AestheticOverlay() {
    const [elements, setElements] = useState<{ id: number; x: number; y: number; type: 'sparkle' | 'petal' }[]>([]);

    useEffect(() => {
        const newElements = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            type: (Math.random() > 0.5 ? 'sparkle' : 'petal') as 'sparkle' | 'petal',
        }));
        setElements(newElements);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {elements.map((el) => (
                <motion.div
                    key={el.id}
                    className="absolute text-kawaii-hot text-4xl drop-shadow-sm"
                    style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                    }}
                    animate={{
                        y: [0, -50, 0],
                        opacity: [0, 1, 0],
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
                    {el.type === 'sparkle' ? '✨' : '🌸'}
                </motion.div>
            ))}
        </div>
    );
}
