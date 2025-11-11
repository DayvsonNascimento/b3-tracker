import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { fetchStockData, searchStocks } from "@/services/stockApi";
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

interface AddStockDialogProps {
  onAdd: (symbol: string, name: string, price: number, change: number, logoUrl?: string) => void;
}

export function AddStockDialog({ onAdd }: AddStockDialogProps) {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ symbol: string; name: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (symbol.trim().length > 0) {
      const results = searchStocks(symbol);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [symbol]);

  const handleSubmit = async (stockSymbol?: string) => {
    const targetSymbol = stockSymbol || symbol;

    if (!targetSymbol.trim()) {
      toast.error("Digite um código de ação");
      return;
    }

    setLoading(true);
    setShowSuggestions(false);

    try {
      const data = await fetchStockData(targetSymbol.trim().toUpperCase());

      onAdd(
        data.symbol,
        data.shortName || data.longName,
        data.regularMarketPrice,
        data.regularMarketChange,
        data.logourl
      );

      toast.success(`Ação ${data.symbol} adicionada com sucesso!`);
      setSymbol("");
      setOpen(false);
    } catch (error) {
      toast.error("Erro ao buscar ação. Verifique o código e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (selectedSymbol: string) => {
    setSymbol(selectedSymbol);
    setShowSuggestions(false);
    handleSubmit(selectedSymbol);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Adicionar Ação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Nova Ação</DialogTitle>
          <DialogDescription>
            Digite o código da ação que deseja monitorar (ex: PETR4, VALE3, ITUB4)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Código da Ação</Label>
            <div className="relative">
              <Input
                id="symbol"
                placeholder="Ex: PETR4, VALE3, ITUB4"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                disabled={loading}
                className="uppercase"
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50">
                  <Command className="rounded-lg border shadow-md bg-popover">
                    <CommandList>
                      <CommandGroup>
                        {suggestions.slice(0, 8).map((stock) => (
                          <CommandItem
                            key={stock.symbol}
                            onSelect={() => handleSelectSuggestion(stock.symbol)}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold">{stock.symbol}</span>
                              <span className="text-sm text-muted-foreground">{stock.name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              "Adicionar"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
