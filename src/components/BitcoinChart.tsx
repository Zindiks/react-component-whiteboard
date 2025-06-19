import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChevronDown, RotateCw } from 'lucide-react';

// List of supported cryptocurrencies
const CRYPTOCURRENCIES = {
  bitcoin: { name: 'Bitcoin', symbol: 'BTC', color: '#f97316' },
  ethereum: { name: 'Ethereum', symbol: 'ETH', color: '#6366f1' },
  solana: { name: 'Solana', symbol: 'SOL', color: '#14b8a6' },
  cardano: { name: 'Cardano', symbol: 'ADA', color: '#3b82f6' },
  dogecoin: { name: 'Dogecoin', symbol: 'DOGE', color: '#eab308' },
  polkadot: { name: 'Polkadot', symbol: 'DOT', color: '#ec4899' },
  ripple: { name: 'XRP', symbol: 'XRP', color: '#4f46e5' },
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
  initialCrypto = 'bitcoin'
}) => {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoId>(initialCrypto);
  const [data, setData] = useState<CryptoData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      setData(prevData => {
        const newPoint: CryptoData = {
          time: now.toLocaleTimeString(),
          price: price,
          timestamp: now.getTime()
        };
        
        // Keep only last 20 data points for better performance
        const updatedData = [...prevData, newPoint].slice(-20);
        return updatedData;
      });
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">{`Time: ${label}`}</p>
          <p className="text-sm font-semibold text-orange-600">
            {`Price: $${payload[0].value.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading && data.length === 0) {
    return (
      <div 
        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
        style={{ width, height }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div 
              className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2"
              style={{ borderColor: CRYPTOCURRENCIES[selectedCrypto].color }}
            ></div>
            <p className="text-sm text-gray-600">Loading {CRYPTOCURRENCIES[selectedCrypto].name} data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="bg-white border border-red-200 rounded-lg p-4 shadow-sm"
        style={{ width, height }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-sm text-red-600 mb-2">Error loading data:</p>
            <p className="text-xs text-red-500">{error}</p>
            <button 
              onClick={fetchCryptoData}
              className="mt-2 px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
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
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
      style={{ width, height }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="relative">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: CRYPTOCURRENCIES[selectedCrypto].color }}
            >
              <span className="text-white text-xs font-bold">{CRYPTOCURRENCIES[selectedCrypto].symbol.charAt(0)}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-800">
              {CRYPTOCURRENCIES[selectedCrypto].name} ({CRYPTOCURRENCIES[selectedCrypto].symbol})
            </h3>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
          
          {/* Dropdown for cryptocurrency selection */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-10 w-48">
              {Object.entries(CRYPTOCURRENCIES).map(([id, crypto]) => (
                <div
                  key={id}
                  className={`flex items-center space-x-2 px-3 py-2 cursor-pointer hover:bg-gray-100 
                              ${selectedCrypto === id ? 'bg-gray-50' : ''}`}
                  onClick={() => {
                    setSelectedCrypto(id as CryptoId);
                    setIsDropdownOpen(false);
                  }}
                >
                  <div 
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: crypto.color }}
                  >
                    <span className="text-white text-[10px] font-bold">{crypto.symbol.charAt(0)}</span>
                  </div>
                  <span className="text-sm">{crypto.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="text-right flex flex-col items-end">
          {currentPrice && (
            <>
              <p className="text-lg font-bold text-gray-900">
                ${currentPrice.toLocaleString()}
              </p>
              {priceChange24h !== null && (
                <p className={`text-xs ${priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {priceChange24h >= 0 ? '▲' : '▼'} {Math.abs(priceChange24h).toFixed(2)}%
                </p>
              )}
            </>
          )}
          <button 
            onClick={() => fetchCryptoData()} 
            className="text-gray-400 hover:text-gray-600 mt-1"
            title="Refresh data"
          >
            <RotateCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: height - 80 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={['dataMin - 100', 'dataMax + 100']}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={CRYPTOCURRENCIES[selectedCrypto].color}
              strokeWidth={2}
              dot={{ fill: CRYPTOCURRENCIES[selectedCrypto].color, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: CRYPTOCURRENCIES[selectedCrypto].color, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span>Live updates every 30s</span>
        <span>
          {data.length} data point{data.length !== 1 ? 's' : ''}
          {data.length > 0 && ` • ${CRYPTOCURRENCIES[selectedCrypto].symbol}/USD`}
        </span>
      </div>
    </div>
  );
};
