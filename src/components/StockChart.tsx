import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { HistoricalDataPoint, TimeRange } from "@/services/stockApi";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StockChartProps {
  data: HistoricalDataPoint[];
  isLoading?: boolean;
  periodVariation?: "positive" | "negative" | "neutral";
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
}

const timeRangeLabels: Record<TimeRange, string> = {
  "1w": "7D",
  "1mo": "1M",
  "3mo": "3M",
  "6mo": "6M",
  "1y": "1A",
  "5y": "5A",
};

const timeRanges: TimeRange[] = ["1w", "1mo", "3mo", "6mo", "1y", "5y"];

export function StockChart({
  data,
  isLoading,
  periodVariation = "neutral",
  timeRange = "1mo",
  onTimeRangeChange,
}: StockChartProps) {
  // Calculate period percentage change for display
  const getPeriodChangeInfo = () => {
    if (!data || data.length < 2) return null;

    const firstPrice = data[0].close;
    const lastPrice = data[data.length - 1].close;
    const change = lastPrice - firstPrice;
    const changePercent = ((change / firstPrice) * 100);

    return {
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2),
    };
  };

  const periodChange = getPeriodChangeInfo();

  return (
    <div className="space-y-3">
      {/* Header com botões e variação do período */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Botões de seleção de período */}
        {onTimeRangeChange && (
          <div className="flex items-center gap-1 flex-wrap">
            {timeRanges.map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => onTimeRangeChange(range)}
                disabled={isLoading}
                className={cn(
                  "h-7 px-2.5 text-xs font-medium",
                  timeRange === range && "pointer-events-none"
                )}
              >
                {timeRangeLabels[range]}
              </Button>
            ))}
          </div>
        )}

        {/* Variação do período */}
        {periodChange && (
          <div className={cn(
            "text-sm font-semibold flex items-center gap-1",
            periodVariation === "positive" && "text-green-600 dark:text-green-500",
            periodVariation === "negative" && "text-red-600 dark:text-red-500",
            periodVariation === "neutral" && "text-muted-foreground"
          )}>
            {periodVariation === "positive" && "+"}
            {periodChange.change !== "0.00" && `R$ ${periodChange.change}`}
            <span className="text-xs">
              ({periodVariation === "positive" && "+"}
              {periodChange.changePercent}%)
            </span>
          </div>
        )}
      </div>

      {/* Gráfico ou estados de loading/erro */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando gráfico...</p>
          </div>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">Dados históricos não disponíveis</p>
        </div>
      ) : (
        renderChart(data, periodVariation)
      )}
    </div>
  );
}

function renderChart(data: HistoricalDataPoint[], periodVariation: "positive" | "negative" | "neutral") {

  // Format date for display (DD/MM)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  // Format value as currency
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2)}`;
  };

  // Colors based on period variation
  const getChartColor = () => {
    switch (periodVariation) {
      case "positive":
        return "#10b981"; // Green
      case "negative":
        return "#ef4444"; // Red
      case "neutral":
        return "#6b7280"; // Gray
      default:
        return "#6b7280";
    }
  };

  const chartColor = getChartColor();
  const chartData = data.map(d => ({
    ...d,
    displayDate: formatDate(d.date),
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`colorPrice-${periodVariation}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="displayDate"
            className="text-xs text-muted-foreground"
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            className="text-xs text-muted-foreground"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number) => [formatCurrency(value), 'Fechamento']}
            labelFormatter={(label) => `Data: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={chartColor}
            strokeWidth={2}
            fill={`url(#colorPrice-${periodVariation})`}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

