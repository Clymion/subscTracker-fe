/**
 * Based on docs/openapi/components/schemas/exchange_rate.schemas.yaml
 */
export interface ExchangeRate {
  date: string;
  base_currency: string;
  rates: {
    [currency_code: string]: number;
  };
}

/**
 * Represents the parameters for fetching exchange rates.
 * Corresponds to the query parameters of the /exchange-rates API.
 */
export interface UseExchangeRatesParams {
  date?: string;
  base_currency?: string;
  target_currencies?: string; // Comma-separated currency codes
}

export interface ExchangeRateResponse {
  data: ExchangeRate;
}
