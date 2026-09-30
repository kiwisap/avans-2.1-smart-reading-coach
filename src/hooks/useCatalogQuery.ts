import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface CatalogFilters {
    search: string;
    types: string[];
    levels: string[];
    themes: string[];
}

export const EMPTY_FILTERS: CatalogFilters = {
    search: '',
    types: [],
    levels: [],
    themes: [],
};

const LEVELS = ['2F', '3F', '3F+'];
const MAX_SEARCH_LENGTH = 100;
// Same limit as the API accepts per filter.
export const MAX_PER_FILTER = 10;

// A filter can be repeated in the URL (?theme=a&theme=b): unique, non empty, not too many.
function readList(params: URLSearchParams, key: string): string[] {
    return [...new Set(params.getAll(key).filter(Boolean))].slice(0, MAX_PER_FILTER);
}

// Reads the catalog state from a URL query, for example ?search=liefde&level=3F&level=3F%2B&theme=humor&page=2.
// Values that make no sense (a made up level, page=-4) are ignored instead of causing errors.
export function parseCatalogQuery(params: URLSearchParams): {
    filters: CatalogFilters;
    page: number;
} {
    const page = Number.parseInt(params.get('page') ?? '', 10);
    return {
        filters: {
            search: (params.get('search') ?? '').slice(0, MAX_SEARCH_LENGTH),
            types: readList(params, 'type'),
            levels: readList(params, 'level').filter((level) => LEVELS.includes(level)),
            themes: readList(params, 'theme'),
        },
        page: Number.isInteger(page) && page > 0 ? page : 1,
    };
}

// The reverse: only filled in filters end up in the URL, so shared links stay short.
export function buildCatalogQuery(filters: CatalogFilters, page: number): URLSearchParams {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    for (const type of filters.types) params.append('type', type);
    for (const level of filters.levels) params.append('level', level);
    for (const theme of filters.themes) params.append('theme', theme);
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
