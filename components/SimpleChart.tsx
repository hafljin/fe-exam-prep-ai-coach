'use client';

interface ChartData {
  type?: 'trend' | 'range' | 'transition';
  line?: {
    price: number;
    touches?: number; // タッチ回数
  };
  priceAction?: {
    high: number;
    low: number;
    close: number;
    open: number;
  }[];
}

interface SimpleChartProps {
  data?: ChartData;
  width?: number;
  height?: number;
}

export default function SimpleChart({ 
  data, 
  width = 400, 
  height = 250 
}: SimpleChartProps) {
  // デフォルトデータ（問題に応じてカスタマイズ可能）
  const defaultData: ChartData = {
    type: 'trend',
    line: {
      price: 60,
      touches: 3,
    },
    priceAction: [
      { high: 70, low: 50, open: 55, close: 65 },
      { high: 75, low: 60, open: 65, close: 70 },
      { high: 80, low: 65, open: 70, close: 75 },
      { high: 75, low: 60, open: 75, close: 65 },
      { high: 70, low: 55, open: 65, close: 60 },
      { high: 65, low: 50, open: 60, close: 55 },
      { high: 60, low: 45, open: 55, close: 50 },
      { high: 55, low: 40, open: 50, close: 45 },
    ],
  };

  const chartData = data || defaultData;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // 価格範囲を計算
  const prices = chartData.priceAction || [];
  const allPrices = prices.flatMap(p => [p.high, p.low, p.open, p.close]);
  const minPrice = Math.min(...allPrices, chartData.line?.price || 0);
  const maxPrice = Math.max(...allPrices, chartData.line?.price || 100);
  const priceRange = maxPrice - minPrice || 1;

  // 価格をY座標に変換
  const priceToY = (price: number) => {
    return padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  // X座標を計算
  const candleWidth = chartWidth / (prices.length || 1);
  const getX = (index: number) => padding + index * candleWidth + candleWidth / 2;

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-4">
      <svg width={width} height={height} className="w-full h-auto">
        {/* グリッド線 */}
        <defs>
          <pattern id="grid" width={candleWidth} height={chartHeight / 4} patternUnits="userSpaceOnUse">
            <path d={`M ${candleWidth} 0 L 0 0 0 ${chartHeight / 4}`} fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width={chartWidth} height={chartHeight} x={padding} y={padding} fill="url(#grid)" />

        {/* ライン（水平線） */}
        {chartData.line && (
          <g>
            <line
              x1={padding}
              y1={priceToY(chartData.line.price)}
              x2={padding + chartWidth}
              y2={priceToY(chartData.line.price)}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray={chartData.line.touches && chartData.line.touches >= 3 ? "0" : "5,5"}
              opacity={chartData.line.touches && chartData.line.touches >= 3 ? 1 : 0.5}
            />
            {/* タッチポイント */}
            {chartData.line.touches && chartData.line.touches >= 3 && prices.length > 0 && (
              <>
                {[0, Math.floor(prices.length / 2), prices.length - 1].map((idx) => (
                  <circle
                    key={idx}
                    cx={getX(idx)}
                    cy={priceToY(chartData.line!.price)}
                    r="4"
                    fill="#3b82f6"
                  />
                ))}
              </>
            )}
          </g>
        )}

        {/* ローソク足 */}
        {prices.map((candle, index) => {
          const x = getX(index);
          const bodyTop = priceToY(Math.max(candle.open, candle.close));
          const bodyBottom = priceToY(Math.min(candle.open, candle.close));
          const bodyHeight = bodyBottom - bodyTop || 1;
          const isBullish = candle.close > candle.open;

          return (
            <g key={index}>
              {/* ヒゲ */}
              <line
                x1={x}
                y1={priceToY(candle.high)}
                x2={x}
                y2={priceToY(candle.low)}
                stroke={isBullish ? "#10b981" : "#ef4444"}
                strokeWidth="1"
              />
              {/* 実体 */}
              <rect
                x={x - candleWidth * 0.3}
                y={bodyTop}
                width={candleWidth * 0.6}
                height={bodyHeight}
                fill={isBullish ? "#10b981" : "#ef4444"}
              />
            </g>
          );
        })}

        {/* 現在価格（最後のローソク足） */}
        {prices.length > 0 && (
          <g>
            <circle
              cx={getX(prices.length - 1)}
              cy={priceToY(prices[prices.length - 1].close)}
              r="5"
              fill="#f59e0b"
              stroke="white"
              strokeWidth="2"
            />
          </g>
        )}

        {/* Y軸ラベル（価格） */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const price = minPrice + priceRange * (1 - ratio);
          return (
            <text
              key={ratio}
              x={padding - 5}
              y={padding + chartHeight * ratio}
              textAnchor="end"
              fontSize="10"
              fill="#6b7280"
            >
              {price.toFixed(0)}
            </text>
          );
        })}
      </svg>
      
      {/* チャート説明 */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        {chartData.type === 'trend' && '上昇トレンド'}
        {chartData.type === 'range' && 'レンジ相場'}
        {chartData.type === 'transition' && '転換期'}
        {chartData.line && chartData.line.touches && chartData.line.touches >= 3 && ' | ライン有効'}
      </div>
    </div>
  );
}

