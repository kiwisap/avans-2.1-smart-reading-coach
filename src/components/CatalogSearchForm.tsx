import { memo, useEffect, useMemo, useRef, useState, type SubmitEvent } from 'react';
import { MAX_PER_FILTER, EMPTY_FILTERS, type CatalogFilters } from '../hooks/useCatalogQuery.ts';
import { typeLabel } from '../i18n/labels.ts';
import type { BookFacets } from '../types/api.ts';
import MultiComboboxField from './MultiComboboxField.tsx';
import { useTranslation } from 'react-i18next';

const SEARCH_DEBOUNCE_MS = 500;

interface CatalogSearchFormProps {
    filters: CatalogFilters; // applied filters, from the URL
    options: BookFacets;
    onApply: (filters: CatalogFilters) => void;
    onReset: () => void;
}

// The search box and filters of the catalogue. It owns the draft (what the user is typing), so a
// keystroke re-renders only this form and not the 18 book cards below it. `memo` also keeps it
// from re-rendering when the page re-renders for other reasons, such as a reading list notice.
// Keep the props stable (the hook returns stable callbacks) or the memo does nothing.
function CatalogSearchForm({ filters, options, onApply, onReset }: CatalogSearchFormProps) {
    const { t } = useTranslation();
    const [draft, setDraft] = useState<CatalogFilters>(filters);
    const draftRef = useRef(draft); // latest draft, read by the search timer below

    // When the URL changes (back button, a followed link, "clear filters") the form follows it.
    const [syncedFilters, setSyncedFilters] = useState(filters);
    if (syncedFilters !== filters) {
        setSyncedFilters(filters);
        setDraft(filters);
    }

    useEffect(() => {
        draftRef.current = draft;
    }, [draft]);

    // Search as you type: 500 ms after the last keystroke the search text is applied, but only
    // when it differs from what is already applied.
    useEffect(() => {
        if (draft.search.trim() === filters.search) return undefined;
        const timer = window.setTimeout(() => {
            const latest = draftRef.current;
            onApply({ ...latest, search: latest.search.trim() });
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [draft.search, filters.search, onApply]);

    // Only rebuilt when the facets change, not on every keystroke.
    const typeOptions = useMemo(
        () => options.types.map((type) => ({ value: type, label: typeLabel(type) })),
        [options.types],
    );
    const levelOptions = useMemo(
        () => options.levels.map((level) => ({ value: level, label: level })),
        [options.levels],
    );
    const themeOptions = useMemo(
        () => options.themes.map((theme) => ({ value: theme, label: theme })),
        [options.themes],
    );

    function updateList(field: 'types' | 'levels' | 'themes') {
        return (values: string[]) => setDraft((current) => ({ ...current, [field]: values }));
    }

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        onApply({ ...draft, search: draft.search.trim() });
    }

    function handleReset() {
        setDraft(EMPTY_FILTERS);
        onReset();
    }

    return (
        <form onSubmit={handleSubmit} role="search">
            <div className="hero-search input-group mb-3">
                <span className="input-group-text ps-3" aria-hidden="true">
                    <i className="bi bi-search" />
                </span>
                <label htmlFor="catalog-search" className="visually-hidden">
                    {t('catalog.searchLabel')}
                </label>
                <input
                    id="catalog-search"
                    type="search"
                    className="form-control"
                    placeholder={t('catalog.searchPlaceholder')}
                    maxLength={100}
                    value={draft.search}
                    onChange={(event) => {
                        const search = event.target.value;
                        setDraft((current) => ({ ...current, search }));
                    }}
                />
                <button type="submit" className="btn btn-primary rounded-pill px-4">
                    {t('catalog.search')}
                </button>
            </div>

            <div className="row g-2 align-items-start flex-nowrap">
                <div className="col-4">
                    <MultiComboboxField
                        label={t('catalog.filterType')}
                        wrapperClassName="mb-0"
                        maxSelected={MAX_PER_FILTER}
                        emptyText={t('catalog.noTypes')}
                        values={draft.types}
                        onChange={updateList('types')}
                        options={typeOptions}
                    />
                </div>
                <div className="col-4">
                    <MultiComboboxField
                        label={t('catalog.filterLevel')}
                        wrapperClassName="mb-0"
                        maxSelected={MAX_PER_FILTER}
                        emptyText={t('catalog.noLevels')}
                        values={draft.levels}
                        onChange={updateList('levels')}
                        options={levelOptions}
                    />
                </div>
                <div className="col-4">
                    <MultiComboboxField
                        label={t('catalog.filterThemes')}
                        wrapperClassName="mb-0"
                        maxSelected={MAX_PER_FILTER}
                        emptyText={t('catalog.noThemes')}
                        values={draft.themes}
                        onChange={updateList('themes')}
                        options={themeOptions}
                    />
                </div>
            </div>
            <button
                type="button"
                className="btn btn-link text-nowrap px-0 mt-2"
                onClick={handleReset}
            >
                <i className="bi bi-arrow-counterclockwise me-1" aria-hidden="true" />
                {t('catalog.clearAll')}
            </button>
        </form>
    );
}

export default memo(CatalogSearchForm);
