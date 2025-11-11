import { useState, useEffect } from "react";
import { Stock } from "@/types/stock";
import { StockCard } from "@/components/StockCard";
import { AddStockDialog } from "@/components/AddStockDialog";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { fetchStockData } from "@/services/stockApi";
import { toast } from "sonner";
import { Save, RefreshCw, TrendingUp } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const Index = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [savedStocks, setSavedStocks] = useLocalStorage<Stock[]>("monitored-stocks", []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setStocks(savedStocks);
  }, []);

  const addStock = (symbol: string, name: string, price: number, change: number) => {
    const newStock: Stock = {
      id: `${symbol}-${Date.now()}`,
      symbol,
      name,
      price,
      change,
      changePercent: (change / (price - change)) * 100,
      updatedAt: new Date().toISOString(),
    };

    setStocks((prev) => [...prev, newStock]);
    setHasUnsavedChanges(true);
  };

  const removeStock = (id: string) => {
    setStocks((prev) => prev.filter((stock) => stock.id !== id));
    setHasUnsavedChanges(true);
  };

  const saveStocks = () => {
    setSavedStocks(stocks);
    setHasUnsavedChanges(false);
    toast.success("Lista de ações salva com sucesso!");
  };

  const refreshPrices = async () => {
    if (stocks.length === 0) {
      toast.info("Adicione ações para atualizar os preços");
      return;
    }

    setIsRefreshing(true);

    try {
      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          try {
            const data = await fetchStockData(stock.symbol);
            return {
              ...stock,
              price: data.close,
              change: data.change,
              changePercent: (data.change / (data.close - data.change)) * 100,
              updatedAt: new Date().toISOString(),
            };
          } catch (error) {
            console.error(`Erro ao atualizar ${stock.symbol}:`, error);
            return stock;
          }
        })
      );

      setStocks(updatedStocks);
      toast.success("Preços atualizados!");
    } catch (error) {
      toast.error("Erro ao atualizar preços");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setStocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        setHasUnsavedChanges(true);
        return newOrder;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Monitor de Ações B3</h1>
          </div>
          <p className="text-muted-foreground">
            Monitore os preços das suas ações favoritas da Bolsa de Valores
          </p>
        </header>

        <div className="flex flex-wrap gap-3 mb-6">
          <AddStockDialog onAdd={addStock} />
          <Button
            variant="outline"
            onClick={refreshPrices}
            disabled={isRefreshing || stocks.length === 0}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar Preços
          </Button>
          <Button
            variant={hasUnsavedChanges ? "default" : "outline"}
            onClick={saveStocks}
            disabled={stocks.length === 0}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar Lista
            {hasUnsavedChanges && (
              <span className="ml-1 h-2 w-2 rounded-full bg-warning animate-pulse" />
            )}
          </Button>
        </div>

        {stocks.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <TrendingUp className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Nenhuma ação monitorada
            </h2>
            <p className="text-muted-foreground mb-6">
              Comece adicionando suas primeiras ações para monitorar
            </p>
            <AddStockDialog onAdd={addStock} />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={stocks} strategy={verticalListSortingStrategy}>
              <div className="grid gap-4">
                {stocks.map((stock) => (
                  <StockCard key={stock.id} stock={stock} onRemove={removeStock} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default Index;
