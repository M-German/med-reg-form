import { MutableRefObject, useEffect, useRef } from "react";

export default function useDebounce<T extends Function>(func: T, delay: number) {
    const timeoutRef: MutableRefObject<NodeJS.Timeout | undefined> = useRef();

    function clearTimer() {     
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
    }

    useEffect(() => (clearTimer), []);

    return {
        debounced: (...args: any) => {
            clearTimer();
            timeoutRef.current = setTimeout(() => func(...args), delay);
        },
        clearTimer
    };
}