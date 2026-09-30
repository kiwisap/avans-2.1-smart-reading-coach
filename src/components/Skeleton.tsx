interface SkeletonProps {
    lines?: number;
    label?: string;
}

// Placeholder blocks shown while data loads. Screen readers get a single "Loading" message.
export default function Skeleton({ lines = 3, label = 'Loading' }: SkeletonProps) {
    return (
        <div role="status" aria-busy="true">
            <span className="visually-hidden">{label}</span>
            <div aria-hidden="true">
                {Array.from({ length: lines }, (_, index) => (
                    <div key={index} className="skeleton" />
                ))}
            </div>
        </div>
    );
}
