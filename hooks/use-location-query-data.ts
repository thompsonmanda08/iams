import {
  getCountries,
  getProvincesByCountry,
  getTownsByProvince
} from "@/app/_actions/backoffice-actions";
import { QUERY_KEYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch all countries
 * @param enabled - Optional boolean to enable/disable the query
 */
export const useCountries = (enabled = true) =>
  useQuery({
    queryKey: [QUERY_KEYS.COUNTRIES],
    queryFn: () => getCountries(),
    staleTime: Infinity,
    enabled
  });

/**
 * Hook to fetch provinces by country ID
 * @param countryId - The ID of the country to fetch provinces for
 * @param enabled - Optional boolean to enable/disable the query (defaults to true if countryId exists)
 */
export const useProvinces = (countryId?: string, enabled?: boolean) =>
  useQuery({
    queryKey: [QUERY_KEYS.PROVINCES, countryId],
    queryFn: () => getProvincesByCountry(countryId!),
    staleTime: Infinity,
    enabled: enabled !== undefined ? enabled : !!countryId
  });

/**
 * Hook to fetch towns by province ID
 * @param provinceId - The ID of the province to fetch towns for
 * @param enabled - Optional boolean to enable/disable the query (defaults to true if provinceId exists)
 */
export const useTowns = (provinceId?: string, enabled?: boolean, params?: any) =>
  useQuery({
    queryKey: [QUERY_KEYS.TOWNS, provinceId],
    queryFn: () => getTownsByProvince(provinceId!, params),
    staleTime: Infinity,
    enabled: enabled !== undefined ? enabled : !!provinceId
  });
