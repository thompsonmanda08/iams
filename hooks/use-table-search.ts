import { useState, useEffect, useRef, useMemo } from "react";
import { useDebounce } from "./use-debounce";

interface UseTableSearchOptions<T> {
  /** Initial search value — e.g. from URL params. Local state syncs when this changes externally. */
  initialValue?: string;
  /** Called with the debounced value after the user stops typing. Use this to call router.push / updateSearchParams. */
  onDebouncedChange?: (value: string) => void;
  /** Data array for client-side filtering. When provided alongside filterFn, returns filteredData. */
  data?: T[];
  /** Predicate for client-side filtering. Required when `data` is provided. */
  filterFn?: (item: T, query: string) => boolean;
  /** Debounce delay in ms. Default: 500 */
  debounceMs?: number;
}

interface UseTableSearchReturn<T> {
  /** Current typed value — bind to the controlled input's `value` prop. */
  searchValue: string;
  /** Setter for the controlled input's `onChange` handler. */
  setSearchValue: (value: string) => void;
  /** Client-side filtered data. Empty array when not in client-side mode. */
  filteredData: T[];
  /** The debounced search value — useful as a React Query key dependency. */
  debouncedSearch: string;
}

export function useTableSearch<T = unknown>({
  initialValue = "",
  onDebouncedChange,
  data,
  filterFn,
  debounceMs = 500,
}: UseTableSearchOptions<T>): UseTableSearchReturn<T> {
  const [searchValue, setSearchValue] = useState(initialValue);
  const debouncedSearch = useDebounce(searchValue, debounceMs);

  // Skip firing onDebouncedChange on mount — only fire when the debounced value
  // actually changes after the initial render.
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    onDebouncedChange?.(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Sync local state when the external initial value changes (e.g. "Clear Filters" resets URL).
  useEffect(() => {
    setSearchValue(initialValue);
  }, [initialValue]);

  // Client-side filtering — only runs when data + filterFn are supplied.
  const filteredData = useMemo<T[]>(() => {
    if (!data || !filterFn) return (data as T[]) ?? [];
    if (!debouncedSearch.trim()) return data;
    return data.filter((item) => filterFn(item, debouncedSearch));
  }, [data, filterFn, debouncedSearch]);

  return { searchValue, setSearchValue, filteredData, debouncedSearch };
}
