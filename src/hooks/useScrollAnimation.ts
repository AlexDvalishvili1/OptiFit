import {useEffect, useMemo, useRef, useState, type RefObject, createRef} from "react";

export interface UseScrollAnimationOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

export function useScrollAnimation<T extends HTMLElement>(
    options: UseScrollAnimationOptions = {}
): [RefObject<T | null>, boolean] {
    const {threshold = 0.1, rootMargin = "0px", triggerOnce = true} = options;

    const ref = useRef<T | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) observer.unobserve(element);
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            {threshold, rootMargin}
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold, rootMargin, triggerOnce]);

    return [ref, isVisible];
}

export function useMultipleScrollAnimation(
    count: number,
    options: UseScrollAnimationOptions = {}
): [RefObject<HTMLDivElement | null>[], boolean[]] {
    const {threshold = 0.1, rootMargin = "0px", triggerOnce = true} = options;

    // create stable refs array (won't change between renders unless count changes)
    const refs = useMemo(
        () => Array.from({length: count}, () => createRef<HTMLDivElement>()),
        [count]
    );

    const [visibleStates, setVisibleStates] = useState<boolean[]>(
        () => Array(count).fill(false)
    );

    // keep visibleStates length in sync if count changes
    useEffect(() => {
        setVisibleStates((prev) => {
            if (prev.length === count) return prev;
            const next = Array(count).fill(false);
            for (let i = 0; i < Math.min(prev.length, count); i++) next[i] = prev[i];
            return next;
        });
    }, [count]);

    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        refs.forEach((ref, index) => {
            const element = ref.current;
            if (!element) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    const intersecting = Boolean(entry?.isIntersecting);

                    setVisibleStates((prev) => {
                        // micro-opt: avoid recreating array if no change
                        if (prev[index] === intersecting && triggerOnce) return prev;
                        const next = [...prev];
                        next[index] = intersecting ? true : !triggerOnce ? false : prev[index];
                        return next;
                    });

                    if (intersecting && triggerOnce) observer.unobserve(element);
                },
                {threshold, rootMargin}
            );

            observer.observe(element);
            observers.push(observer);
        });

        return () => observers.forEach((obs) => obs.disconnect());
    }, [refs, threshold, rootMargin, triggerOnce]);

    return [refs, visibleStates];
}