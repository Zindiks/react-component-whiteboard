import React, { useState, useEffect } from "react";
import { TrendingUp, RotateCcw } from "lucide-react";
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

// List of supported cryptocurrencies
const CRYPTOCURRENCIES = {
  bitcoin: { name: "Bitcoin", symbol: "BTC", color: "#f97316" },
  ethereum: { name: "Ethereum", symbol: "ETH", color: "#6366f1" },
  solana: { name: "Solana", symbol: "SOL", color: "#14b8a6" },
  cardano: { name: "Cardano", symbol: "ADA", color: "#3b82f6" },
  dogecoin: { name: "Dogecoin", symbol: "DOGE", color: "#eab308" },
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

  const fetchCryptoData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch current price
      const priceResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${selectedCrypto}&vs_currencies=usd&include_24hr_change=true`
      );
      const priceData = await priceResponse.json();
      
      setCurrentPrice(priceData[selectedCrypto]?.usd || 0);
      setPriceChange24h(priceData[selectedCrypto]?.usd_24h_change || 0);

      // Fetch historical data (7 days)
      const historyResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/${selectedCrypto}/market_chart?vs_currency=usd&days=7&interval=hourly`
      );
      const historyData = await historyResponse.json();

      if (historyData.prices) {
        const formattedData = historyData.prices.slice(0, 24).map(([timestamp, price]: [number, number]) => ({
          time: new Date(timestamp).toLocaleDateString(),
          price: Math.round(price * 100) / 100,
          timestamp,
        }));
        setData(formattedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
  }, [selectedCrypto]);

  if (loading && data.length === 0) {
    return (
      <Card className="border-gray-200 bg-white shadow-sm" style={{ width, height }}>
        <CardContent className="p-4 flex items-center justify-center h-full">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2"
              style={{ borderColor: CRYPTOCURRENCIES[selectedCrypto].color }}
            ></div>
            <p className="text-sm text-muted-foreground">
              Loading {CRYPTOCURRENCIES[selectedCrypto].name} data...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-white shadow-sm" style={{ width, height }}>
        <CardContent className="p-4 flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-sm text-destructive mb-2">Error loading data:</p>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button onClick={fetchCryptoData} size="sm" className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 bg-white shadow-sm" style={{ width, height }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp size={20} style={{ color: CRYPTOCURRENCIES[selectedCrypto].color }} />
            <h3 className="font-semibold text-sm">
              {CRYPTOCURRENCIES[selectedCrypto].name} ({CRYPTOCURRENCIES[selectedCrypto].symbol})
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <Select
              value={selectedCrypto}
              onValueChange={(value: CryptoId) => setSelectedCrypto(value)}
            >
              <SelectTrigger className="w-20 h-6 border-none shadow-none p-1 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CRYPTOCURRENCIES).map(([id, crypto]) => (
                  <SelectItem key={id} value={id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: crypto.color }}
                      />
                      <span>{crypto.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => fetchCryptoData()}
              disabled={loading}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <RotateCcw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
            </Button>
          </div>
        </div>

        {/* Price display */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-left flex flex-col items-start">
            {currentPrice && (
              <>
                <p className="text-2xl font-bold">
                  ${currentPrice.toLocaleString()}
                </p>
                {priceChange24h !== null && (
                  <Badge
                    variant={priceChange24h >= 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {priceChange24h >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(priceChange24h).toFixed(2)}%
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>

        {/* Simple chart placeholder */}
        <div 
          className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm" 
          style={{ height: Math.max(height - 160, 100) }}
        >
          Chart: {data.length} data points • 24h trend
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>Live updates</span>
          <span>
            {data.length} data point{data.length !== 1 ? "s" : ""}
            {data.length > 0 &&
              ` • ${CRYPTOCURRENCIES[selectedCrypto].symbol}/USD`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BitcoinChart;
