import { useState, useRef, useEffect } from 'react';

export const useCountdown = (initialSeconds: number = 0) => {
    const [coldTime, setColdTime] = useState(initialSeconds);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (coldTime > 0) {
            timerRef.current = setTimeout(() => setColdTime(coldTime - 1), 1000);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [coldTime]);

    const startCountdown = (seconds: number) => setColdTime(seconds);
    const resetCountdown = () => setColdTime(0);

    return { coldTime, startCountdown, resetCountdown };
};