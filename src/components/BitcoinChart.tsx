import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { RotateCw, TrendingUp } from "lucide-react";
import { ComponentHeader } from "./ComponentHeader";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

// List of supported cryptocurrencies
const CRYPTOCURRENCIES = {
  bitcoin: { name: "Bitcoin", symbol: "BTC", color: "#f97316" },
  ethereum: { name: "Ethereum", symbol: "ETH", color: "#6366f1" },
  solana: { name: "Solana", symbol: "SOL", color: "#14b8a6" },
  cardano: { name: "Cardano", symbol: "ADA", color: "#3b82f6" },
  dogecoin: { name: "Dogecoin", symbol: "DOGE", color: "#eab308" },
  polkadot: { name: "Polkadot", symbol: "DOT", color: "#ec4899" },
  ripple: { name: "XRP", symbol: "XRP", color: "#4f46e5" },
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
  onHeaderMouseDown?: (event: React.MouseEvent) => void;
  onDelete?: (event: React.MouseEvent) => void;
}

export const BitcoinChart: React.FC<CryptoChartProps> = ({
  width = 400,
  height = 300,
  initialCrypto = "bitcoin",
  onHeaderMouseDown,
  onDelete,
}) => {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoId>(initialCrypto);
  const [data, setData] = useState<CryptoData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the name for the selected crypto
  const cryptoName = CRYPTOCURRENCIES[selectedCrypto].name;

  // Fetch cryptocurrency price data
  const fetchCryptoData = async () => {
    try {
      setError(null);

      // Fetch current price from CoinGecko API (free, no API key needed)
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${selectedCrypto}&vs_currencies=usd&include_24hr_change=true`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${cryptoName} data`);
      }

      const priceData = await response.json();
      const price = priceData[selectedCrypto].usd;
      const change24h = priceData[selectedCrypto].usd_24h_change || 0;
      const now = new Date();

      setCurrentPrice(price);
      setPriceChange24h(change24h);

      // Add new data point
      setData((prevData) => {
        const newPoint: CryptoData = {
          time: now.toLocaleTimeString(),
          price: price,
          timestamp: now.getTime(),
        };

        // Keep only last 20 data points for better performance
        const updatedData = [...prevData, newPoint].slice(-20);
        return updatedData;
      });

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  };

  // Initial fetch and set up interval
  useEffect(() => {
    // Reset data when changing crypto
    setData([]);
    setCurrentPrice(null);
    setPriceChange24h(null);
    setLoading(true);

    fetchCryptoData();

    // Update every 30 seconds (CoinGecko rate limit friendly)
    const interval = setInterval(fetchCryptoData, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCrypto]);

  // Custom tooltip formatter
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-md p-3">
          <p className="text-sm text-muted-foreground">{`Time: ${label}`}</p>
          <p className="text-sm font-semibold text-foreground">
            {`Price: $${payload[0].value.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading && data.length === 0) {
    return (
      <Card className="border-gray-200" style={{ width, height }}>
        <ComponentHeader
          title={`${CRYPTOCURRENCIES[selectedCrypto].name} (${CRYPTOCURRENCIES[selectedCrypto].symbol})`}
          icon={TrendingUp}
          iconColor="bg-gray-500"
          onMouseDown={onHeaderMouseDown}
          onDelete={onDelete}
        />
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
      <Card className="border-destructive/50" style={{ width, height }}>
        <ComponentHeader
          title={`${CRYPTOCURRENCIES[selectedCrypto].name} (${CRYPTOCURRENCIES[selectedCrypto].symbol})`}
          icon={TrendingUp}
          iconColor="bg-destructive"
          onMouseDown={onHeaderMouseDown}
          onDelete={onDelete}
        />
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
    <Card className="border-gray-200" style={{ width, height }}>
      <ComponentHeader
        title={`${CRYPTOCURRENCIES[selectedCrypto].name} (${CRYPTOCURRENCIES[selectedCrypto].symbol})`}
        icon={TrendingUp}
        iconColor={CRYPTOCURRENCIES[selectedCrypto].color}
        onMouseDown={onHeaderMouseDown}
        onDelete={onDelete}
        actions={
          <div className="flex items-center space-x-1">
            <Select
              value={selectedCrypto}
              onValueChange={(value: CryptoId) => setSelectedCrypto(value)}
            >
              <SelectTrigger className="w-16 h-6 border-none shadow-none p-1">
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
                      <span>{crypto.name}</span>
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
              <RotateCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        }
      />

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-left flex flex-col items-start">
            {currentPrice && (
              <>
                <p className="text-lg font-bold">
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

        {/* Chart */}
        <div style={{ width: "100%", height: height - 80 }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                domain={["dataMin - 100", "dataMax + 100"]}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke={CRYPTOCURRENCIES[selectedCrypto].color}
                strokeWidth={2}
                dot={{
                  fill: CRYPTOCURRENCIES[selectedCrypto].color,
                  strokeWidth: 2,
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                  stroke: CRYPTOCURRENCIES[selectedCrypto].color,
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>Live updates every 30s</span>
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
