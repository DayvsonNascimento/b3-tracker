import { useState, useEffect, useCallback } from 'react';
import { Stock, SavedStock } from '@/types/stock';
import { StockCard } from '@/components/StockCard';
import { AddStockDialog } from '@/components/AddStockDialog';
import { ApiTokenDialog } from '@/components/ApiTokenDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { fetchStockData } from '@/services/stockApi';
import { toast } from 'sonner';
import { Save, RefreshCw, Pause, Play, ArrowUpDown } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

type SortOption =
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'change-asc'
  | 'change-desc'
  | 'symbol-asc'
  | 'symbol-desc';

const Index = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [savedStocks, setSavedStocks] = useLocalStorage<SavedStock[]>(
    'monitored-stocks',
    []
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Auto-refresh states
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useLocalStorage(
    'auto-refresh-enabled',
    true
  );
  const [refreshInterval] = useLocalStorage('refresh-interval', 60); // seconds
  const [countdown, setCountdown] = useState(refreshInterval);

  // Sorting state
  const [sortOption, setSortOption] = useLocalStorage<SortOption>(
    'sort-option',
    'default'
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires moving 8px before activating drag (prevents accidental clicks)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load saved stocks and fetch prices from API on mount
  useEffect(() => {
    const loadStocksWithPrices = async () => {
      if (savedStocks.length === 0) {
        setIsInitialLoading(false);
        return;
      }

      setIsInitialLoading(true);
      try {
        const stocksWithPrices = await Promise.all(
          savedStocks.map(async (savedStock) => {
            try {
              const data = await fetchStockData(savedStock.symbol);
              return {
                ...savedStock,
                price: data.regularMarketPrice,
                change: data.regularMarketChange,
                changePercent:
                  (data.regularMarketChange /
                    (data.regularMarketPrice - data.regularMarketChange)) *
                  100,
                updatedAt: new Date().toISOString(),
                logoUrl: data.logourl,
              };
            } catch (error) {
              console.error(`Error loading ${savedStock.symbol}:`, error);
              // Return with default values if it fails
              return {
                ...savedStock,
                price: 0,
                change: 0,
                changePercent: 0,
                updatedAt: new Date().toISOString(),
                logoUrl: undefined,
              };
            }
          })
        );
        setStocks(stocksWithPrices);
      } catch (error) {
        console.error('Error loading stocks:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadStocksWithPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addStock = (
    symbol: string,
    name: string,
    price: number,
    change: number,
    logoUrl?: string
  ) => {
    const newStock: Stock = {
      id: `${symbol}-${Date.now()}`,
      symbol,
      name,
      price,
      change,
      changePercent: (change / (price - change)) * 100,
      updatedAt: new Date().toISOString(),
      logoUrl,
    };

    setStocks((prev) => [...prev, newStock]);
    setHasUnsavedChanges(true);
  };

  const removeStock = (id: string) => {
    setStocks((prev) => prev.filter((stock) => stock.id !== id));
    setHasUnsavedChanges(true);
  };

  const saveStocks = () => {
    // Save only metadata (without prices)
    const stocksMetadata: SavedStock[] = stocks.map((stock) => ({
      id: stock.id,
      symbol: stock.symbol,
      name: stock.name,
    }));
    setSavedStocks(stocksMetadata);
    setHasUnsavedChanges(false);
    toast.success('Lista de ações salva com sucesso!');
  };

  const refreshPrices = useCallback(
    async (silent = false) => {
      if (stocks.length === 0) {
        if (!silent) toast.info('Adicione ações para atualizar os preços');
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
                price: data.regularMarketPrice,
                change: data.regularMarketChange,
                changePercent:
                  (data.regularMarketChange /
                    (data.regularMarketPrice - data.regularMarketChange)) *
                  100,
                updatedAt: new Date().toISOString(),
                logoUrl: data.logourl,
              };
            } catch (error) {
              console.error(`Erro ao atualizar ${stock.symbol}:`, error);
              return stock;
            }
          })
        );

        setStocks(updatedStocks);
        if (!silent) toast.success('Preços atualizados!');
      } catch (error) {
        if (!silent) toast.error('Erro ao atualizar preços');
      } finally {
        setIsRefreshing(false);
        setCountdown(refreshInterval); // Reset countdown after refresh
      }
    },
    [stocks, refreshInterval]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
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

    setActiveId(null);
  };

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
    setCountdown(refreshInterval);
    toast.info(
      autoRefreshEnabled
        ? 'Auto-atualização desativada'
        : 'Auto-atualização ativada'
    );
  };

  const getSortedStocks = (): Stock[] => {
    const stocksCopy = [...stocks];

    switch (sortOption) {
      case 'price-asc':
        return stocksCopy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return stocksCopy.sort((a, b) => b.price - a.price);
      case 'change-asc':
        return stocksCopy.sort((a, b) => a.changePercent - b.changePercent);
      case 'change-desc':
        return stocksCopy.sort((a, b) => b.changePercent - a.changePercent);
      case 'symbol-asc':
        return stocksCopy.sort((a, b) => a.symbol.localeCompare(b.symbol));
      case 'symbol-desc':
        return stocksCopy.sort((a, b) => b.symbol.localeCompare(a.symbol));
      default:
        return stocksCopy; // default/manual order
    }
  };

  // Auto-refresh countdown effect
  useEffect(() => {
    if (!autoRefreshEnabled || stocks.length === 0 || isRefreshing) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refreshPrices(true); // silent refresh
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    autoRefreshEnabled,
    stocks.length,
    isRefreshing,
    refreshInterval,
    refreshPrices,
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}assets/logo.png`}
                alt="B3 Tracker Logo"
                className="h-10 w-10 object-contain"
              />
              <h1 className="text-4xl font-bold text-foreground">
                Monitor de Ações B3
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <ApiTokenDialog />
            </div>
          </div>
          <p className="text-muted-foreground">
            Monitore os preços das suas ações favoritas da Bolsa de Valores
          </p>
        </header>

        <div className="flex flex-wrap gap-3 mb-6">
          <AddStockDialog onAdd={addStock} />
          <Button
            variant="outline"
            onClick={() => refreshPrices(false)}
            disabled={isRefreshing || stocks.length === 0}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Atualizar Preços
          </Button>
          <Button
            variant={autoRefreshEnabled ? 'default' : 'outline'}
            onClick={toggleAutoRefresh}
            disabled={stocks.length === 0}
            className="gap-2"
          >
            {autoRefreshEnabled ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Auto-atualização
            {autoRefreshEnabled && stocks.length > 0 && (
              <span className="ml-1 text-xs opacity-75">({countdown}s)</span>
            )}
          </Button>
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => {
                const options: SortOption[] = [
                  'default',
                  'price-desc',
                  'price-asc',
                  'change-desc',
                  'change-asc',
                  'symbol-asc',
                  'symbol-desc',
                ];
                const currentIndex = options.indexOf(sortOption);
                const nextOption = options[(currentIndex + 1) % options.length];
                setSortOption(nextOption);

                const labels: Record<SortOption, string> = {
                  default: 'Ordem manual',
                  'price-desc': 'Maior preço',
                  'price-asc': 'Menor preço',
                  'change-desc': 'Maior alta',
                  'change-asc': 'Maior baixa',
                  'symbol-asc': 'Símbolo A-Z',
                  'symbol-desc': 'Símbolo Z-A',
                };
                toast.info(`Ordenação: ${labels[nextOption]}`);
              }}
              disabled={stocks.length === 0}
              className="gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              Ordenar
            </Button>
          </div>
          <Button
            variant={hasUnsavedChanges ? 'default' : 'outline'}
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

        {isInitialLoading ? (
          <div className="text-center py-16">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4 p-4">
              <RefreshCw className="h-10 w-10 animate-spin text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Carregando preços atualizados...
            </h2>
            <p className="text-muted-foreground">
              Buscando dados das suas ações
            </p>
          </div>
        ) : stocks.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4 p-4">
              <img
                src={`${import.meta.env.BASE_URL}assets/logo.png`}
                alt="B3 Tracker Logo"
                className="w-full h-full object-contain opacity-70"
              />
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
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={stocks}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-4">
                {getSortedStocks().map((stock) => (
                  <StockCard
                    key={stock.id}
                    stock={stock}
                    onRemove={removeStock}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay
              dropAnimation={{
                duration: 250,
                easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              {activeId ? (
                <div className="opacity-80 rotate-2 scale-105">
                  <StockCard
                    stock={stocks.find((s) => s.id === activeId)!}
                    onRemove={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default Index;
