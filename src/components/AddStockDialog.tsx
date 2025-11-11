import { useState } from "react";
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
import { fetchStockData } from "@/services/stockApi";
import { toast } from "sonner";

interface AddStockDialogProps {
  onAdd: (symbol: string, name: string, price: number, change: number) => void;
}

export function AddStockDialog({ onAdd }: AddStockDialogProps) {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol.trim()) {
      toast.error("Digite um código de ação");
      return;
    }

    setLoading(true);

    try {
      const data = await fetchStockData(symbol.trim().toUpperCase());
      
      onAdd(
        data.stock,
        data.name,
        data.close,
        data.change
      );

      toast.success(`Ação ${data.stock} adicionada com sucesso!`);
      setSymbol("");
      setOpen(false);
    } catch (error) {
      toast.error("Erro ao buscar ação. Verifique o código e tente novamente.");
    } finally {
      setLoading(false);
    }
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Código da Ação</Label>
            <Input
              id="symbol"
              placeholder="Ex: PETR4"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              disabled={loading}
              className="uppercase"
            />
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
