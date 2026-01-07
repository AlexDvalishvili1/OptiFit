export function scrollToId(id: string, style: ScrollLogicalPosition) {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({
        behavior: "smooth",
        block: style,
    });
}