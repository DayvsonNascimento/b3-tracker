import { StockApiResponse } from "@/types/stock";

// Lista de ações populares da B3 para autocomplete
export const popularStocks = [
  { symbol: "PETR4", name: "Petrobras PN" },
  { symbol: "PETR3", name: "Petrobras ON" },
  { symbol: "VALE3", name: "Vale ON" },
  { symbol: "ITUB4", name: "Itaú Unibanco PN" },
  { symbol: "BBDC4", name: "Bradesco PN" },
  { symbol: "BBDC3", name: "Bradesco ON" },
  { symbol: "BBAS3", name: "Banco do Brasil ON" },
  { symbol: "ABEV3", name: "Ambev ON" },
  { symbol: "WEGE3", name: "Weg ON" },
  { symbol: "MGLU3", name: "Magazine Luiza ON" },
  { symbol: "ITSA4", name: "Itaúsa PN" },
  { symbol: "BBSE3", name: "BB Seguridade ON" },
  { symbol: "LREN3", name: "Lojas Renner ON" },
  { symbol: "RENT3", name: "Localiza ON" },
  { symbol: "RAIL3", name: "Rumo ON" },
  { symbol: "RADL3", name: "Raia Drogasil ON" },
  { symbol: "SUZB3", name: "Suzano ON" },
  { symbol: "JBSS3", name: "JBS ON" },
  { symbol: "BRFS3", name: "BRF ON" },
  { symbol: "EMBR3", name: "Embraer ON" },
  { symbol: "GGBR4", name: "Gerdau PN" },
  { symbol: "CSAN3", name: "Cosan ON" },
  { symbol: "VIVT3", name: "Telefônica Brasil ON" },
  { symbol: "ELET3", name: "Eletrobras ON" },
  { symbol: "CMIG4", name: "Cemig PN" },
  { symbol: "CPLE6", name: "Copel PNB" },
  { symbol: "TAEE11", name: "Taesa UNT" },
  { symbol: "KLBN11", name: "Klabin UNT" },
  { symbol: "BPAC11", name: "BTG Pactual UNT" },
  { symbol: "SANB11", name: "Santander UNT" },
];

const API_BASE_URL = "https://brapi.dev/api";

// Obtém o token da localStorage ou usa vazio para ações de teste
function getApiToken(): string {
  return localStorage.getItem("brapi_token") || "";
}

export async function fetchStockData(symbol: string): Promise<StockApiResponse> {
  try {
    const token = getApiToken();
    const url = token 
      ? `${API_BASE_URL}/quote/${symbol}?token=${token}`
      : `${API_BASE_URL}/quote/${symbol}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token inválido ou expirado. Configure seu token da brapi.dev");
      }
      throw new Error(`Erro ao buscar dados: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error("Ação não encontrada");
    }
    
    return data.results[0];
  } catch (error) {
    console.error("Erro na API:", error);
    throw error;
  }
}

export function searchStocks(query: string): Array<{ symbol: string; name: string }> {
  if (!query.trim()) return [];
  
  const searchTerm = query.toUpperCase();
  return popularStocks.filter(
    (stock) =>
      stock.symbol.includes(searchTerm) ||
      stock.name.toUpperCase().includes(searchTerm)
  );
}
