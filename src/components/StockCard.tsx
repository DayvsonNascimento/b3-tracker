import { Stock } from "@/types/stock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface StockCardProps {
  stock: Stock;
  onRemove: (id: string) => void;
}

export function StockCard({ stock, onRemove }: StockCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stock.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isPositive = stock.change >= 0;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-4 hover:shadow-lg transition-all duration-200",
        isDragging && "opacity-50 shadow-xl"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-1"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-bold text-lg text-foreground">{stock.symbol}</h3>
              <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(stock.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-2xl font-bold text-foreground">
                R$ {stock.price.toFixed(2)}
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
                {stock.changePercent.toFixed(2)}%
              </p>
              <p
                className={cn(
                  "text-sm",
                  isPositive ? "text-chart-positive" : "text-chart-negative"
                )}
              >
                {isPositive ? "+" : ""}R$ {stock.change.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
