import { useEffect } from "react";

export const useAutoResetBanner = (states, delay = 5000) => {
    useEffect(() => {
        const timers = states
            .filter(([value]) => value)
            .map(([, setter]) => setTimeout(() => setter(false), delay));

        return () => timers.forEach(timer => clearTimeout(timer));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...states.map(([value]) => value), delay]);
};