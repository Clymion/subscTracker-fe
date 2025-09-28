import { useQuery } from '@tanstack/react-query';

import apiClient from '@/lib/api-client';

import { ExchangeRate, ExchangeRateResponse, UseExchangeRatesParams } from '../types';

/**
 * Fetches exchange rate data from the API.
 * @param params - The parameters for the API request.
 * @returns A promise that resolves to the exchange rate data.
 */
export const getExchangeRates = async (params: UseExchangeRatesParams): Promise<ExchangeRate> => {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  // URLにGETパラメータを入れる
  const queryString = new URLSearchParams(params as Record<string, string>).toString();
  const url = queryString ? `/exchange-rates?${queryString}` : '/exchange-rates';

  const response = await apiClient.get<ExchangeRateResponse>(url, { headers });
  return response.data;
};

/**
 * Custom hook to fetch exchange rates using react-query.
 * @param params - The parameters for fetching exchange rates.
 * @returns The result of the react-query useQuery hook.
 */
export const useExchangeRates = (params: UseExchangeRatesParams = {}) => {
  return useQuery<ExchangeRate, Error>({
    // queryKey is used by react-query to manage caching.
    // It includes the base key and parameters to ensure uniqueness.
    queryKey: ['exchange-rates', params],
    queryFn: () => getExchangeRates(params),
    // Optional: Configure staleTime, cacheTime, etc. as needed.
    // For example, keep data fresh for 5 minutes.
    staleTime: 1000 * 60 * 5,
  });
};
