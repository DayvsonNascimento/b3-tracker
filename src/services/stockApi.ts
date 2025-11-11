import { StockApiResponse } from "@/types/stock";

const API_BASE_URL = "https://brapi.dev/api";

export async function fetchStockData(symbol: string): Promise<StockApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/quote/${symbol}?token=demo`);
    
    if (!response.ok) {
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

export async function searchStock(query: string): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/available?search=${query}`);
    
    if (!response.ok) {
      throw new Error(`Erro na busca: ${response.status}`);
    }
    
    const data = await response.json();
    return data.stocks || [];
  } catch (error) {
    console.error("Erro na busca:", error);
    return [];
  }
}
