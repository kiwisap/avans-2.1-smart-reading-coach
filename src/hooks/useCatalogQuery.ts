import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface CatalogFilters {
    search: string;
    type: string;
    level: string;
    theme: string;
}

export const EMPTY_FILTERS: CatalogFilters = { search: '', type: '', level: '', theme: '' };

const LEVELS = ['2F', '3F', '3F+'];
const MAX_SEARCH_LENGTH = 100;

// Reads the catalog state from a URL query, for example ?search=liefde&level=3F&page=2.
// Values that make no sense (a made up level, page=-4) are ignored instead of causing errors.
export function parseCatalogQuery(params: URLSearchParams): {
    filters: CatalogFilters;
    page: number;
} {
    const level = params.get('level') ?? '';
    const page = Number.parseInt(params.get('page') ?? '', 10);
    return {
        filters: {
            search: (params.get('search') ?? '').slice(0, MAX_SEARCH_LENGTH),
            type: params.get('type') ?? '',
            level: LEVELS.includes(level) ? level : '',
            theme: params.get('theme') ?? '',
        },
        page: Number.isInteger(page) && page > 0 ? page : 1,
    };
}

// The reverse: only filled in filters end up in the URL, so shared links stay short.
export function buildCatalogQuery(filters: CatalogFilters, page: number): URLSearchParams {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
        if (value) params.set(key, value);
    }
    if (page > 1) params.set('page', String(page));
    return params;
}

// The catalog filters and page number live in the URL, so a link can be shared or bookmarked
// and the back button goes to the previous search.
export function useCatalogQuery() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryString = searchParams.toString();

    const { filters, page } = useMemo(
        () => parseCatalogQuery(new URLSearchParams(queryString)),
        [queryString],
    );

    const apply = useCallback(
        (next: CatalogFilters) => setSearchParams(buildCatalogQuery(next, 1)),
        [setSearchParams],
    );

    const changePage = useCallback(
        (next: number) => setSearchParams(buildCatalogQuery(filters, next)),
        [filters, setSearchParams],
    );

    const reset = useCallback(() => setSearchParams(new URLSearchParams()), [setSearchParams]);

    return { filters, page, apply, changePage, reset };
}
