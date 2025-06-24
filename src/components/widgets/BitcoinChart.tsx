import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";

// Extended list of supported cryptocurrencies
const CRYPTOCURRENCIES = {
  bitcoin: { name: "Bitcoin", symbol: "BTC", color: "#f7931a" },
  ethereum: { name: "Ethereum", symbol: "ETH", color: "#627eea" },
  solana: { name: "Solana", symbol: "SOL", color: "#9945ff" },
  cardano: { name: "Cardano", symbol: "ADA", color: "#0033ad" },
  dogecoin: { name: "Dogecoin", symbol: "DOGE", color: "#c2a633" },
  binancecoin: { name: "Binance Coin", symbol: "BNB", color: "#f3ba2f" },
  ripple: { name: "XRP", symbol: "XRP", color: "#23292f" },
  polygon: { name: "Polygon", symbol: "MATIC", color: "#8247e5" },
  chainlink: { name: "Chainlink", symbol: "LINK", color: "#375bd2" },
  litecoin: { name: "Litecoin", symbol: "LTC", color: "#bfbbbb" },
};

type CryptoId = keyof typeof CRYPTOCURRENCIES;

interface CryptoData {
  time: string;
  price: number;
  timestamp: number;
}

interface CryptoChartProps {
  width?: number;
  height?: number;
  initialCrypto?: CryptoId;
}

const SimpleLineChart: React.FC<{
  data: CryptoData[];
  width: number;
  height: number;
  color: string;
}> = ({ data, width, height, color }) => {
  if (data.length < 2) return null;

  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const priceRange = maxPrice - minPrice || 1;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.price - minPrice) / priceRange) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Grid lines */}
      <defs>
        <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-muted-foreground/20"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Area under the curve */}
      <defs>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.05 }} />
        </linearGradient>
      </defs>
      <path
        d={`M0,${height} L${points} L${width},${height} Z`}
        fill="url(#areaGradient)"
      />

      {/* Main line */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        className="drop-shadow-sm"
      />

      {/* Data points */}
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.price - minPrice) / priceRange) * height;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2"
            fill={color}
            className="drop-shadow-sm"
          />
        );
      })}
    </svg>
  );
};

export const BitcoinChart: React.FC<CryptoChartProps> = ({
  width = 400,
  height = 300,
  initialCrypto = "bitcoin",
}) => {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoId>(initialCrypto);
  const [data, setData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const createDemoData = useCallback(() => {
    // Demo prices for different cryptocurrencies
    const demoPrices = {
      bitcoin: 45000,
      ethereum: 2800,
      solana: 95,
      cardano: 0.45,
      dogecoin: 0.08,
      binancecoin: 310,
      ripple: 0.52,
      polygon: 0.85,
      chainlink: 14.5,
      litecoin: 95,
    };

    const demoPrice = demoPrices[selectedCrypto] || 100;
    const demoChange = (Math.random() - 0.5) * 10; // Random change between -5% and +5%

    setCurrentPrice(demoPrice);
    setPriceChange24h(demoChange);

    // Create mock chart data
    const mockData = [];
    const change = demoChange / 100;

    for (let i = 0; i < 24; i++) {
      const hoursAgo = 23 - i;
      const timestamp = Date.now() - hoursAgo * 60 * 60 * 1000;

      // Simulate price movement over 24 hours
      const progress = i / 23;
      const priceVariation = Math.sin(progress * Math.PI * 2) * 0.02; // Small random variation
      const trendPrice = demoPrice * (1 - change * (1 - progress));
      const finalPrice = trendPrice * (1 + priceVariation);

      mockData.push({
        time: new Date(timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        price: Math.round(finalPrice * 100) / 100,
        timestamp,
      });
    }

    setData(mockData);
  }, [selectedCrypto]);

  const fetchCryptoData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${selectedCrypto}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const coinData = await response.json();

      if (!coinData.market_data) {
        throw new Error("No market data available");
      }

      // Set current price and 24h change
      const currentPriceUSD = coinData.market_data.current_price?.usd;
      const priceChange = coinData.market_data.price_change_percentage_24h;

      if (typeof currentPriceUSD !== "number") {
        throw new Error("Invalid price data received");
      }

      setCurrentPrice(currentPriceUSD);
      setPriceChange24h(priceChange || 0);
      setIsDemoMode(false);

      // Use sparkline data for the chart (7 days of data points)
      const sparklineData = coinData.market_data.sparkline_7d?.price;

      if (
        sparklineData &&
        Array.isArray(sparklineData) &&
        sparklineData.length > 0
      ) {
        // Take the last 24 data points (roughly 24 hours if it's hourly data)
        const recentData = sparklineData.slice(-24);

        const formattedData = recentData.map((price: number, index: number) => {
          // Create timestamps for the last 24 hours
          const hoursAgo = 23 - index;
          const timestamp = Date.now() - hoursAgo * 60 * 60 * 1000;

          return {
            time: new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            price: Math.round(price * 100) / 100,
            timestamp,
          };
        });

        setData(formattedData);
      } else {
        // Create chart data based on current price and change
        const mockData = [];
        const change = (priceChange || 0) / 100;

        for (let i = 0; i < 24; i++) {
          const hoursAgo = 23 - i;
          const timestamp = Date.now() - hoursAgo * 60 * 60 * 1000;

          // Simulate price movement over 24 hours
          const progress = i / 23;
          const priceVariation = Math.sin(progress * Math.PI * 2) * 0.02; // Small random variation
          const trendPrice = currentPriceUSD * (1 - change * (1 - progress));
          const finalPrice = trendPrice * (1 + priceVariation);

          mockData.push({
            time: new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            price: Math.round(finalPrice * 100) / 100,
            timestamp,
          });
        }

        setData(mockData);
      }
    } catch (err) {
      console.error("Crypto data fetch error:", err);

      // If API fails, switch to demo mode with realistic mock data
      if (
        err instanceof Error &&
        (err.name === "AbortError" || err.message.includes("API Error"))
      ) {
        setIsDemoMode(true);
        createDemoData();
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setData([]);
        setCurrentPrice(null);
        setPriceChange24h(null);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCrypto, createDemoData]);

  useEffect(() => {
    fetchCryptoData();

    // Auto-refresh every 10 minutes (less frequent to avoid rate limiting)
    const interval = setInterval(fetchCryptoData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchCryptoData]);

  const isPositiveChange = (priceChange24h || 0) >= 0;
  const cryptoInfo = CRYPTOCURRENCIES[selectedCrypto];

  if (loading && data.length === 0) {
    return (
      <Card style={{ width, height }}>
        <CardContent className="p-4 flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
              style={{ borderColor: cryptoInfo.color }}
            />
            <p className="text-sm text-muted-foreground">
              Loading {cryptoInfo.name} data...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50" style={{ width, height }}>
        <CardContent className="p-4 flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <p className="text-sm text-destructive">Error loading data</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button onClick={fetchCryptoData} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ width, height }}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isPositiveChange ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
            <h3 className="font-semibold text-sm text-foreground">
              {cryptoInfo.name}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {cryptoInfo.symbol}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Select
              value={selectedCrypto}
              onValueChange={(value: CryptoId) => setSelectedCrypto(value)}
            >
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CRYPTOCURRENCIES).map(([id, crypto]) => (
                  <SelectItem key={id} value={id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: crypto.color }}
                      />
                      <span>{crypto.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={fetchCryptoData}
              disabled={loading}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Price display */}
        <div className="space-y-1">
          {currentPrice && (
            <div className="text-2xl font-bold text-foreground">
              $
              {currentPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: currentPrice < 1 ? 6 : 2,
              })}
            </div>
          )}

          {priceChange24h !== null && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium",
                isPositiveChange
                  ? "text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950/50"
                  : "text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950/50"
              )}
            >
              {isPositiveChange ? "↗" : "↘"}{" "}
              {Math.abs(priceChange24h).toFixed(2)}%
            </Badge>
          )}
        </div>

        {/* Chart */}
        <div className="relative">
          <div className="text-xs text-muted-foreground mb-2">
            24H Price Chart • {data.length} data points
          </div>
          <div
            className="bg-background/50 border rounded-lg p-3"
            style={{ height: Math.max(height - 200, 120) }}
          >
            {data.length > 1 ? (
              <SimpleLineChart
                data={data}
                width={width - 56} // Account for padding
                height={Math.max(height - 240, 80)}
                color={isPositiveChange ? "#22c55e" : "#ef4444"} // Green for up, red for down
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Insufficient data for chart
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{isDemoMode ? "Demo data" : "Live data via CoinGecko"}</span>
          <span>Auto-refresh: 10min</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BitcoinChart;
