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
import { Settings, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function ApiTokenDialog() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("brapi_token") || "");

  const handleSave = () => {
    if (token.trim()) {
      localStorage.setItem("brapi_token", token.trim());
      toast.success("Token salvo com sucesso!");
    } else {
      localStorage.removeItem("brapi_token");
      toast.info("Token removido. Usando modo limitado.");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Token da API</DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              Para buscar todas as ações da B3, você precisa de um token gratuito da brapi.dev.
            </p>
            <p className="text-xs">
              <strong>Sem token:</strong> Apenas PETR4, VALE3, MGLU3 e ITUB4 estão disponíveis.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Token da brapi.dev</Label>
            <Input
              id="token"
              type="password"
              placeholder="Cole seu token aqui"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => window.open("https://brapi.dev/dashboard", "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Obter Token Gratuito
            </Button>
            
            <Button onClick={handleSave} className="w-full">
              Salvar Token
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Como obter:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Acesse brapi.dev/dashboard</li>
              <li>Crie uma conta gratuita</li>
              <li>Copie seu token de acesso</li>
              <li>Cole aqui e salve</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
