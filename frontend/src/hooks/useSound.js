import { useRef, useCallback, useEffect } from 'react';

export const useSound = () => {
    const soundRefs = useRef({
        incoming: new Audio('/sounds/incoming.mp3'),
        join: new Audio('/sounds/join.mp3'),
        leave: new Audio('/sounds/leave.mp3'),
    });

    const playSound = useCallback((soundType, shouldLoop = false) => {
        try {
            const sound = soundRefs.current[soundType];
            if (sound) {
                sound.currentTime = 0; // Reset sound to start
                sound.loop = shouldLoop;
                sound.volume = 1.0; // Ensure volume is up
                const playPromise = sound.play();

                if (playPromise !== undefined) {
                    playPromise.catch((error) => {
                        console.error(`Error playing ${soundType} sound:`, error);
                    });
                }
            }
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }, []);

    const stopSound = useCallback((soundType) => {
        try {
            const sound = soundRefs.current[soundType];
            if (sound) {
                sound.pause();
                sound.currentTime = 0;
                sound.loop = false;
            }
        } catch (error) {
            console.error('Error stopping sound:', error);
        }
    }, []);

    // Add this inside the useSound hook to verify sound files are loading
    useEffect(() => {
        Object.entries(soundRefs.current).forEach(([name, audio]) => {
            audio.addEventListener('error', (e) => {
                console.error(`Error loading ${name} sound:`, e);
            });

            audio.addEventListener('canplaythrough', () => {
                console.log(`${name} sound loaded successfully`);
            });
        });
    }, []);

    return { playSound, stopSound };
};

