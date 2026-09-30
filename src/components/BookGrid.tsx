import type { ReactNode } from 'react';

// Responsive grid: 1 column on phones, 2 on tablets, 3 on desktops.
export default function BookGrid({ children }: { children: ReactNode }) {
    return <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">{children}</div>;
}
