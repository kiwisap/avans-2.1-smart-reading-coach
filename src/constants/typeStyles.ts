// Icon and colour per material type, so the catalog is easy to scan.
// The type is always also shown as text, colour is only a hint.
interface TypeStyle {
    icon: string; // Bootstrap Icons class
    accent: string; // Bootstrap colour name
}

export const TYPE_STYLES: Record<string, TypeStyle> = {
    boek: { icon: 'bi-book', accent: 'primary' },
    'online-artikel': { icon: 'bi-globe2', accent: 'info' },
    blogpost: { icon: 'bi-pencil-square', accent: 'warning' },
    dichtbundel: { icon: 'bi-feather', accent: 'danger' },
    tijdschrift: { icon: 'bi-journal-richtext', accent: 'success' },
    krant: { icon: 'bi-newspaper', accent: 'secondary' },
};

export const DEFAULT_TYPE_STYLE: TypeStyle = { icon: 'bi-file-text', accent: 'secondary' };
