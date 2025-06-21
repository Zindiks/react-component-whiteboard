import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeftRight, RefreshCw, DollarSign } from "lucide-react";
import { ComponentHeader } from "./ComponentHeader";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyConverterProps {
  width?: number;
  height?: number;
  onHeaderMouseDown?: (event: React.MouseEvent) => void;
  onDelete?: (event: React.MouseEvent) => void;
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
  onDelete,
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
      <Card className="border-gray-200" style={{ width, height }}>
        <ComponentHeader
          title="Currency Converter"
          icon={DollarSign}
          iconColor="bg-gray-500"
          onMouseDown={onHeaderMouseDown}
          onDelete={onDelete}
        />
        <CardContent className="p-4 flex items-center justify-center h-full">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Loading exchange rates...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50" style={{ width, height }}>
        <ComponentHeader
          title="Currency Converter"
          icon={DollarSign}
          iconColor="bg-destructive"
          onMouseDown={onHeaderMouseDown}
          onDelete={onDelete}
        />
        <CardContent className="p-4 flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-sm text-destructive mb-2">
              Error loading rates:
            </p>
            <p className="text-xs text-muted-foreground mb-3">{error}</p>
            <Button onClick={fetchExchangeRates} size="sm">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200" style={{ width, height }}>
      <ComponentHeader
        title="Currency Converter"
        icon={DollarSign}
        iconColor="bg-green-500"
        onMouseDown={onHeaderMouseDown}
        onDelete={onDelete}
        actions={
          <Button
            onClick={fetchExchangeRates}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        }
      />

      <CardContent className="p-4">
        {/* Amount Input */}
        <div className="mb-3">
          <Label htmlFor="amount" className="text-xs font-medium">
            Amount
          </Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-sm"
            placeholder="Enter amount"
          />
        </div>

        {/* Currency Selection */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <Label className="text-xs font-medium">From</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem
                    key={currency.code}
                    value={currency.code}
                    className="text-xs"
                  >
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium">To</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem
                    key={currency.code}
                    value={currency.code}
                    className="text-xs"
                  >
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center mb-3">
          <Button
            onClick={swapCurrencies}
            variant="ghost"
            size="sm"
            className="p-2 h-8 w-8"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Result */}
        <div className="bg-muted rounded-lg p-3 mb-3">
          <div className="text-center">
            <p className="text-lg font-bold">
              {convertedAmount !== null
                ? formatCurrency(convertedAmount, toCurrency)
                : "---"}
            </p>
            <p className="text-xs text-muted-foreground">
              1 {fromCurrency} = {getExchangeRate().toFixed(4)} {toCurrency}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-muted-foreground text-center">
          {lastUpdated && (
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
