import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeftRight, RefreshCw, DollarSign } from "lucide-react";
import { ComponentHeader } from "./ComponentHeader";

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyConverterProps {
  width?: number;
  height?: number;
  onHeaderMouseDown?: (event: React.MouseEvent) => void;
}

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
];

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  width = 320,
  height = 280,
  onHeaderMouseDown,
}) => {
  const [amount, setAmount] = useState<string>("100");
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch exchange rates from a free API
  const fetchExchangeRates = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Using exchangerate-api.com (free tier, no API key required)
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exchange rates");
      }

      const data = await response.json();
      setExchangeRates(data.rates);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }, [fromCurrency]);

  // Calculate conversion whenever amount, currencies, or rates change
  useEffect(() => {
    if (exchangeRates[toCurrency] && amount) {
      const numericAmount = parseFloat(amount);
      if (!isNaN(numericAmount)) {
        const converted = numericAmount * exchangeRates[toCurrency];
        setConvertedAmount(converted);
      } else {
        setConvertedAmount(null);
      }
    }
  }, [amount, toCurrency, exchangeRates]);

  // Fetch rates when component mounts or from currency changes
  useEffect(() => {
    fetchExchangeRates();
  }, [fetchExchangeRates]);

  // Swap currencies
  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatCurrency = (value: number, currencyCode: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getExchangeRate = () => {
    return exchangeRates[toCurrency] || 0;
  };

  if (loading && Object.keys(exchangeRates).length === 0) {
    return (
      <div
        className="bg-white border border-gray-200 rounded-lg shadow-sm"
        style={{ width, height }}
      >
        <ComponentHeader
          title="Currency Converter"
          icon={DollarSign}
          iconColor="bg-gray-500"
          onMouseDown={onHeaderMouseDown}
        />
        <div className="p-4 flex items-center justify-center h-full">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading exchange rates...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-white border border-red-200 rounded-lg shadow-sm"
        style={{ width, height }}
      >
        <ComponentHeader
          title="Currency Converter"
          icon={DollarSign}
          iconColor="bg-red-500"
          onMouseDown={onHeaderMouseDown}
        />
        <div className="p-4 flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-sm text-red-600 mb-2">Error loading rates:</p>
            <p className="text-xs text-red-500 mb-3">{error}</p>
            <button
              onClick={fetchExchangeRates}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm"
      style={{ width, height }}
    >
      <ComponentHeader
        title="Currency Converter"
        icon={DollarSign}
        iconColor="bg-green-500"
        onMouseDown={onHeaderMouseDown}
        actions={
          <button
            onClick={fetchExchangeRates}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
            title="Refresh rates"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        }
      />

      <div className="p-4">
        {/* Amount Input */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter amount"
          />
        </div>

        {/* Currency Selection */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              From
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center mb-3">
          <button
            onClick={swapCurrencies}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Swap currencies"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        </div>

        {/* Result */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">
              {convertedAmount !== null
                ? formatCurrency(convertedAmount, toCurrency)
                : "---"}
            </p>
            <p className="text-xs text-gray-500">
              1 {fromCurrency} = {getExchangeRate().toFixed(4)} {toCurrency}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 text-center">
          {lastUpdated && (
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};
