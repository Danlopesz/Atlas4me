import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
    const fire = useCallback(() => {
        confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#00e5ff', '#0ea5e9', '#ffffff', '#ffd700'],
            ticks: 150,
        });
    }, []);
    return { fire };
}
