// The logo: an open book with a spark of smart advice above it.
export default function BrandMark({ size = 32 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="127 111 1000 1000"
            aria-hidden="true"
            focusable="false"
        >
            <g fill="#1f4d3f">
                <path d="M607 1024L607 634C607 556 462 440 224 436C182 436 152 466 152 508L152 818C152 860 180 887 220 887C392 891 520 944 594 1030C600 1036 607 1032 607 1024Z" />
                <path d="M647 1024L647 634C647 556 792 440 1030 436C1072 436 1102 466 1102 508L1102 818C1102 860 1074 887 1034 887C862 891 734 944 660 1030C654 1036 647 1032 647 1024Z" />
            </g>
            <path
                fill="#b4432b"
                stroke="#b4432b"
                strokeWidth="26"
                strokeLinejoin="round"
                d="M627 200C641 278 664 316 782 346C664 380 641 418 627 498C613 418 590 380 472 346C590 316 613 278 627 200Z"
            />
        </svg>
    );
}
