// The logo: a bookmark in a book cover.
export default function BrandMark({ size = 32 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <rect width="32" height="32" rx="8" fill="#1f4d3f" />
            <path d="M10 6h12v20l-6-4.5L10 26z" fill="#fffdf8" />
            <path d="M10 6h12v5H10z" fill="#b4432b" />
        </svg>
    );
}
