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

const BRAPI_BASE_URL = "https://brapi.dev/api";

// Yahoo Finance tem rate limiting agressivo, então usamos brapi.dev como padrão
// Para habilitar Yahoo, mude USE_YAHOO_FINANCE para true
const USE_YAHOO_FINANCE = true;

const YAHOO_BASE_URL = import.meta.env.DEV
  ? "/api/yahoo/v8/finance/chart"  // Proxy local do Vite
  : "https://query1.finance.yahoo.com/v8/finance/chart";

// Obtém o token da localStorage ou usa vazio para ações de teste
function getApiToken(): string {
  return localStorage.getItem("brapi_token") || "";
}

// Converte símbolo B3 para formato Yahoo Finance (PETR4 -> PETR4.SA)
function toYahooSymbol(symbol: string): string {
  return `${symbol}.SA`;
}

// Busca logo da brapi.dev (mantém logos mesmo usando Yahoo)
async function fetchLogoFromBrapi(symbol: string): Promise<string | undefined> {
  try {
    const token = getApiToken();
    const url = token
      ? `${BRAPI_BASE_URL}/quote/${symbol}?token=${token}`
      : `${BRAPI_BASE_URL}/quote/${symbol}`;

    const response = await fetch(url);
    if (!response.ok) return undefined;

    const data = await response.json();
    return data.results?.[0]?.logourl;
  } catch (error) {
    console.warn("Não foi possível buscar logo da brapi:", error);
    return undefined;
  }
}

// Busca dados do Yahoo Finance
async function fetchFromYahoo(symbol: string): Promise<StockApiResponse> {
  const yahooSymbol = toYahooSymbol(symbol);
  const url = `${YAHOO_BASE_URL}/${yahooSymbol}?interval=1d&range=1d`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Yahoo Finance error: ${response.status}`);
  }

  const data = await response.json();
  const result = data.chart?.result?.[0];

  if (!result) {
    throw new Error("Dados não encontrados no Yahoo Finance");
  }

  const meta = result.meta;
  const quote = result.indicators?.quote?.[0];

  if (!meta || !quote) {
    throw new Error("Formato de dados inválido do Yahoo Finance");
  }

  // Calcula variação
  const currentPrice = meta.regularMarketPrice || 0;
  const previousClose = meta.previousClose || meta.chartPreviousClose || 0;
  const change = currentPrice - previousClose;

  // Busca logo da brapi (assíncrono, não bloqueia)
  const logoPromise = fetchLogoFromBrapi(symbol);

  // Mapeia para o formato StockApiResponse
  const stockData: StockApiResponse = {
    symbol: symbol, // Usa símbolo B3 sem .SA
    shortName: meta.symbol || symbol,
    longName: meta.longName || meta.shortName || symbol,
    currency: meta.currency || "BRL",
    regularMarketPrice: currentPrice,
    regularMarketChange: change,
    regularMarketChangePercent: ((change / previousClose) * 100) || 0,
    regularMarketTime: new Date(meta.regularMarketTime * 1000).toISOString(),
    regularMarketDayHigh: meta.regularMarketDayHigh || 0,
    regularMarketDayLow: meta.regularMarketDayLow || 0,
    regularMarketVolume: meta.regularMarketVolume || 0,
    regularMarketPreviousClose: previousClose,
    regularMarketOpen: quote.open?.[0] || 0,
    regularMarketDayRange: `${meta.regularMarketDayLow || 0} - ${meta.regularMarketDayHigh || 0}`,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 0,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 0,
    fiftyTwoWeekRange: `${meta.fiftyTwoWeekLow || 0} - ${meta.fiftyTwoWeekHigh || 0}`,
    marketCap: meta.marketCap || 0,
    logourl: "", // Será preenchido depois
    priceEarnings: 0, // Yahoo não fornece no endpoint básico
    earningsPerShare: 0,
  };

  // Aguarda logo (com timeout)
  try {
    const logo = await Promise.race([
      logoPromise,
      new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 2000))
    ]);
    if (logo) stockData.logourl = logo;
  } catch (error) {
    console.warn("Timeout ao buscar logo");
  }

  return stockData;
}

// Fallback para brapi.dev
async function fetchFromBrapi(symbol: string): Promise<StockApiResponse> {
  const token = getApiToken();
  const url = token
    ? `${BRAPI_BASE_URL}/quote/${symbol}?token=${token}`
    : `${BRAPI_BASE_URL}/quote/${symbol}`;

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
}

// Função principal: usa brapi.dev por padrão (mais confiável para B3)
export async function fetchStockData(symbol: string): Promise<StockApiResponse> {
  // Se Yahoo Finance estiver habilitado, tenta primeiro
  if (USE_YAHOO_FINANCE) {
    try {
      console.log(`Buscando ${symbol} do Yahoo Finance...`);
      return await fetchFromYahoo(symbol);
    } catch (yahooError) {
      console.warn("Yahoo Finance falhou, tentando brapi.dev...", yahooError);
    }
  }

  // Usa brapi.dev (fonte padrão e confiável)
  try {
    console.log(`Buscando ${symbol} do brapi.dev...`);
    return await fetchFromBrapi(symbol);
  } catch (brapiError) {
    console.error("Erro ao buscar dados:", brapiError);
    throw new Error("Não foi possível buscar dados da ação. Tente novamente.");
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

// Interface para dados históricos
export interface HistoricalDataPoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

// Tipos de ranges disponíveis
export type TimeRange = "1w" | "1mo" | "3mo" | "6mo" | "1y" | "5y";

// Mapeamento de ranges para Yahoo Finance
const yahooRangeMap: Record<TimeRange, string> = {
  "1w": "7d",
  "1mo": "1mo",
  "3mo": "3mo",
  "6mo": "6mo",
  "1y": "1y",
  "5y": "5y",
};

// Mapeamento de ranges para brapi.dev
const brapiRangeMap: Record<TimeRange, string> = {
  "1w": "1d", // brapi não tem 7d, usa 1d e limita resultado
  "1mo": "1mo",
  "3mo": "3mo",
  "6mo": "6mo",
  "1y": "1y",
  "5y": "5y",
};

// Busca dados históricos com range configurável
export async function fetchHistoricalData(
  symbol: string,
  range: TimeRange = "1mo"
): Promise<HistoricalDataPoint[]> {
  if (USE_YAHOO_FINANCE) {
    try {
      return await fetchHistoricalFromYahoo(symbol, range);
    } catch (error) {
      console.warn("Yahoo histórico falhou, tentando brapi...", error);
    }
  }

  // Fallback para brapi.dev
  return await fetchHistoricalFromBrapi(symbol, range);
}

// Busca dados históricos do Yahoo Finance
async function fetchHistoricalFromYahoo(
  symbol: string,
  range: TimeRange = "1mo"
): Promise<HistoricalDataPoint[]> {
  const yahooSymbol = toYahooSymbol(symbol);
  const yahooRange = yahooRangeMap[range];
  const url = `${YAHOO_BASE_URL}/${yahooSymbol}?interval=1d&range=${yahooRange}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Yahoo Finance error: ${response.status}`);
  }

  const data = await response.json();
  const result = data.chart?.result?.[0];

  if (!result) {
    throw new Error("Dados históricos não encontrados");
  }

  const timestamps = result.timestamp || [];
  const quote = result.indicators?.quote?.[0];

  if (!quote) {
    throw new Error("Formato de dados inválido");
  }

  const historicalData: HistoricalDataPoint[] = timestamps.map((timestamp: number, index: number) => ({
    date: new Date(timestamp * 1000).toISOString().split('T')[0],
    close: quote.close?.[index] || 0,
    open: quote.open?.[index] || 0,
    high: quote.high?.[index] || 0,
    low: quote.low?.[index] || 0,
    volume: quote.volume?.[index] || 0,
  }));

  return historicalData.filter(d => d.close > 0); // Remove dados inválidos
}

// Busca dados históricos do brapi.dev
async function fetchHistoricalFromBrapi(
  symbol: string,
  timeRange: TimeRange = "1mo"
): Promise<HistoricalDataPoint[]> {
  const token = getApiToken();
  const range = brapiRangeMap[timeRange];
  const interval = "1d"; // Diário

  const url = token
    ? `${BRAPI_BASE_URL}/quote/${symbol}?range=${range}&interval=${interval}&token=${token}`
    : `${BRAPI_BASE_URL}/quote/${symbol}?range=${range}&interval=${interval}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`brapi.dev error: ${response.status}`);
  }

  const data = await response.json();
  const historicalPrices = data.results?.[0]?.historicalDataPrice || [];

  if (historicalPrices.length === 0) {
    throw new Error("Dados históricos não disponíveis");
  }

  return historicalPrices.map((item: { date: number; close: number; open: number; high: number; low: number; volume: number }) => ({
    date: new Date(item.date * 1000).toISOString().split('T')[0],
    close: item.close || 0,
    open: item.open || 0,
    high: item.high || 0,
    low: item.low || 0,
    volume: item.volume || 0,
  })).reverse(); // brapi retorna do mais recente ao mais antigo
}
