import { useEffect, useRef } from 'react';

export const useIdleTimeout = (timeoutMs, onTimeout) => {
    const timerRef = useRef(null);

    useEffect(() => {
        const resetTimer = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(onTimeout, timeoutMs);
        };

        // Events to track activity
        const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];

        // Attach listeners
        events.forEach(event => window.addEventListener(event, resetTimer));

        // Start initial timer
        resetTimer();

        // Cleanup
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [timeoutMs, onTimeout]);
};
