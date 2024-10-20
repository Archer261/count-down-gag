import React, { useState, useEffect, useRef } from 'react';

const CountdownClock = () => {
    const [targetDate, setTargetDate] = useState(new Date('2024-11-12T00:00:00'));
    const [timeLeft, setTimeLeft] = useState(null);
    const [message, setMessage] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const [isCountdownFinished, setIsCountdownFinished] = useState(false);
    const [endingPhase, setEndingPhase] = useState(0);
    const [isLastDay, setIsLastDay] = useState(false);
    const audioContextRef = useRef(null);
    const lastTickRef = useRef(0);

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const playTick = () => {
        const now = Date.now();
        if (now - lastTickRef.current >= 1000 && !isLastDay) {
            if (audioContextRef.current) {
                const oscillator = audioContextRef.current.createOscillator();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
                oscillator.connect(audioContextRef.current.destination);
                oscillator.start();
                oscillator.stop(audioContextRef.current.currentTime + 0.1);
            }
            lastTickRef.current = now;
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                const milliseconds = Math.floor((difference % 1000) / 10);

                setTimeLeft({ days, hours, minutes, seconds, milliseconds });
                setIsLastDay(days < 1);
                playTick();
            } else {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
                setIsCountdownFinished(true);
                setEndingPhase(1); // Show first message
                setTimeout(() => setEndingPhase(2), 5000); // Hide first message
                setTimeout(() => setEndingPhase(3), 6000); // Show second message
                setTimeout(() => setEndingPhase(4), 11000); // Hide second message
            }
        }, 10);

        return () => clearInterval(timer);
    }, [targetDate, isLastDay]);

    const handleStop = () => {
        setTargetDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(newDate.getDate() - 1);
            return newDate;
        });
        setMessage("Failed to stop, - 1 day");
        setIsShaking(true);
        setTimeout(() => {
            setMessage('');
            setIsShaking(false);
        }, 3000);
    };

    if (timeLeft === null) {
        return <div className="text-neon-green text-4xl">Loading...</div>;
    }

    if (isCountdownFinished) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className={`text-white text-sm ${endingPhase === 1 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000 absolute`}>
                    Execute decom protocol alpha...
                </div>
                <div className={`text-white text-sm ${endingPhase === 3 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000 absolute`}>
                    Goodbye Ben...
                </div>
            </div>
        );
    }

    const timeUnits = isLastDay
        ? ['hours', 'minutes', 'seconds', 'milliseconds']
        : ['days', 'hours', 'minutes', 'seconds'];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-neon-green font-mono p-4">
            <div className="text-xl sm:text-2xl mb-8">Ben...</div>
            <div className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-8 flex flex-wrap justify-center ${isShaking ? 'animate-shake' : ''}`}>
                {timeUnits.map((unit) => (
                    <div key={unit} className="flex flex-col items-center m-2">
                        <span className={`bg-gray-900 px-3 py-2 rounded-lg ${isLastDay ? 'animate-pulse text-red-500 text-5xl sm:text-6xl md:text-7xl' : ''}`}>
                            {unit === 'milliseconds'
                                ? String(timeLeft[unit]).padStart(2, '0')
                                : String(timeLeft[unit]).padStart(2, '0')}
                        </span>
                        <span className="text-xs sm:text-sm mt-2">{unit.charAt(0).toUpperCase() + unit.slice(1)}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={handleStop}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-red-500 to-red-600 
                   shadow-lg transform transition-all duration-200 ease-in-out
                   hover:shadow-xl hover:scale-105 active:scale-95 active:shadow-inner
                   flex items-center justify-center text-white text-xl sm:text-2xl font-bold
                   border-4 sm:border-8 border-red-700 relative overflow-hidden"
            >
                <span className="relative z-10">Stop</span>
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-25 rounded-full"></div>
            </button>
            {message && <div className="mt-4 text-red-500 text-center">{message}</div>}
        </div>
    );
};

export default CountdownClock;