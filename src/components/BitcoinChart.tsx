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

interface BitcoinData {
  time: string;
  price: number;
  timestamp: number;
}

interface BitcoinChartProps {
  width?: number;
  height?: number;
}

export const BitcoinChart: React.FC<BitcoinChartProps> = ({ 
  width = 400, 
  height = 300 
}) => {
  const [data, setData] = useState<BitcoinData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Bitcoin price data
  const fetchBitcoinData = async () => {
    try {
      setError(null);
      
      // Fetch current price from CoinGecko API (free, no API key needed)
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch Bitcoin data');
      }
      
      const priceData = await response.json();
      const price = priceData.bitcoin.usd;
      const now = new Date();
      
      setCurrentPrice(price);
      
      // Add new data point
      setData(prevData => {
        const newPoint: BitcoinData = {
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
    fetchBitcoinData();
    
    // Update every 30 seconds (CoinGecko rate limit friendly)
    const interval = setInterval(fetchBitcoinData, 30000);
    
    return () => clearInterval(interval);
  }, []);

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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading Bitcoin data...</p>
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
              onClick={fetchBitcoinData}
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
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">₿</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Bitcoin (BTC)</h3>
        </div>
        <div className="text-right">
          {currentPrice && (
            <>
              <p className="text-lg font-bold text-gray-900">
                ${currentPrice.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">USD</p>
            </>
          )}
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
              stroke="#f97316" 
              strokeWidth={2}
              dot={{ fill: '#f97316', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#f97316', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span>Live updates every 30s</span>
        <span>{data.length} data points</span>
      </div>
    </div>
  );
};
