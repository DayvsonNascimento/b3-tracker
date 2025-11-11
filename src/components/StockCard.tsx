import { useState } from "react";
import { Stock } from "@/types/stock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { StockChart } from "@/components/StockChart";
import { fetchHistoricalData, HistoricalDataPoint, TimeRange } from "@/services/stockApi";

interface StockCardProps {
  stock: Stock;
  onRemove: (id: string) => void;
}

export function StockCard({ stock, onRemove }: StockCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("1mo");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: stock.id,
    transition: {
      duration: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const price = stock.price ?? 0;
  const change = stock.change ?? 0;
  const changePercent = stock.changePercent ?? 0;
  const isPositive = change >= 0;

  const handleToggleExpand = async () => {
    if (!isExpanded && historicalData.length === 0) {
      // Fetch historical data when expanding for the first time
      await loadHistoricalData(timeRange);
    }
    setIsExpanded(!isExpanded);
  };

  const loadHistoricalData = async (range: TimeRange) => {
    setIsLoadingChart(true);
    try {
      const data = await fetchHistoricalData(stock.symbol, range);
      setHistoricalData(data);
    } catch (error) {
      console.error("Erro ao buscar dados históricos:", error);
      setHistoricalData([]);
    } finally {
      setIsLoadingChart(false);
    }
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    loadHistoricalData(range);
  };

  // Calculate period variation (first vs last price)
  const getPeriodVariation = (): "positive" | "negative" | "neutral" => {
    if (historicalData.length < 2) return "neutral";

    const firstPrice = historicalData[0].close;
    const lastPrice = historicalData[historicalData.length - 1].close;
    const change = lastPrice - firstPrice;

    if (Math.abs(change) < 0.01) return "neutral"; // Insignificant variation
    return change > 0 ? "positive" : "negative";
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-4 transition-all duration-200",
        "hover:shadow-lg hover:scale-[1.01]",
        isDragging && "ring-2 ring-primary ring-offset-2 shadow-2xl cursor-grabbing scale-105 z-50",
        isExpanded && "shadow-xl"
      )}
    >
      <div
        className="flex items-start justify-between gap-3 cursor-pointer"
        onClick={handleToggleExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleExpand();
          }
        }}
      >
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "cursor-grab active:cursor-grabbing mt-1",
            "hover:bg-accent hover:text-accent-foreground rounded-md p-1 -m-1",
            "transition-all duration-150 hover:scale-110",
            "touch-none" // Previne scroll em dispositivos touch
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className={cn(
            "h-5 w-5 transition-colors",
            isDragging ? "text-primary" : "text-muted-foreground"
          )} />
        </div>

        {stock.logoUrl && (
          <div className="flex-shrink-0">
            <img
              src={stock.logoUrl}
              alt={`${stock.symbol} logo`}
              className="w-12 h-12 rounded-lg object-contain bg-muted p-1"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-bold text-lg text-foreground">{stock.symbol}</h3>
              <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleExpand();
                }}
                className="text-muted-foreground hover:text-primary"
                title={isExpanded ? "Ocultar gráfico" : "Mostrar gráfico"}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(stock.id);
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-2xl font-bold text-foreground">
                R$ {price.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                Atualizado: {new Date(stock.updatedAt).toLocaleTimeString("pt-BR")}
              </p>
            </div>

            <div className="text-right">
              <p
                className={cn(
                  "text-lg font-semibold",
                  isPositive ? "text-chart-positive" : "text-chart-negative"
                )}
              >
                {isPositive ? "+" : ""}
                {changePercent.toFixed(2)}%
              </p>
              <p
                className={cn(
                  "text-sm",
                  isPositive ? "text-chart-positive" : "text-chart-negative"
                )}
              >
                {isPositive ? "+" : ""}R$ {change.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico expansível */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top-4 duration-300">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Histórico de Preços</h4>
            <span className="text-xs text-muted-foreground">
              {historicalData.length > 0 && `${historicalData.length} dias`}
            </span>
          </div>
          <StockChart
            data={historicalData}
            isLoading={isLoadingChart}
            periodVariation={getPeriodVariation()}
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
          />
        </div>
      )}
    </Card>
  );
}
