// src/hooks/scrollTo.ts

const NAVBAR_OFFSET_PX = 88; // ~76px navbar + небольшой зазор

export function scrollToId(
    id: string,
    style: ScrollLogicalPosition,
    offsetPx: number = NAVBAR_OFFSET_PX
) {
    const el = document.getElementById(id);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const absoluteTop = rect.top + window.scrollY;

    let targetY = absoluteTop - offsetPx;

    if (style === "center") {
        targetY = absoluteTop - (window.innerHeight / 2 - rect.height / 2) - offsetPx;
    } else if (style === "end") {
        targetY = absoluteTop - (window.innerHeight - rect.height) - offsetPx;
    }

    window.scrollTo({
        top: Math.max(0, targetY),
        behavior: "smooth",
    });
}