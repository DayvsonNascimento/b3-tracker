import { StockApiResponse } from "@/types/stock";

// List of popular B3 stocks for autocomplete
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

// Yahoo Finance with CORS proxy (always uses corsproxy.io)
const USE_YAHOO_FINANCE = true;
const YAHOO_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

// Public CORS proxy (always used)
const CORS_PROXY = "https://corsproxy.io/?";

// Helper function to add CORS proxy
function getProxiedUrl(url: string): string {
  return `${CORS_PROXY}${encodeURIComponent(url)}`;
}

// Get token from localStorage or use empty for test stocks
function getApiToken(): string {
  return localStorage.getItem("brapi_token") || "";
}

// Convert B3 symbol to Yahoo Finance format (PETR4 -> PETR4.SA)
function toYahooSymbol(symbol: string): string {
  return `${symbol}.SA`;
}

// Fetch logo from brapi.dev (keeps logos even when using Yahoo)
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
    console.warn("Could not fetch logo from brapi:", error);
    return undefined;
  }
}

// Fetch data from Yahoo Finance
async function fetchFromYahoo(symbol: string): Promise<StockApiResponse> {
  const yahooSymbol = toYahooSymbol(symbol);
  const url = `${YAHOO_BASE_URL}/${yahooSymbol}?interval=1d&range=1d`;
  const proxiedUrl = getProxiedUrl(url);

  const response = await fetch(proxiedUrl);

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
    throw new Error("Invalid data format from Yahoo Finance");
  }

  // Calculate change
  const currentPrice = meta.regularMarketPrice || 0;
  const previousClose = meta.previousClose || meta.chartPreviousClose || 0;
  const change = currentPrice - previousClose;

  // Fetch logo from brapi (async, non-blocking)
  const logoPromise = fetchLogoFromBrapi(symbol);

  // Map to StockApiResponse format
  const stockData: StockApiResponse = {
    symbol: symbol, // Use B3 symbol without .SA
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
    logourl: "", // Will be filled later
    priceEarnings: 0, // Yahoo doesn't provide this in basic endpoint
    earningsPerShare: 0,
  };

  // Wait for logo (with timeout)
  try {
    const logo = await Promise.race([
      logoPromise,
      new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 2000))
    ]);
    if (logo) stockData.logourl = logo;
  } catch (error) {
    console.warn("Timeout fetching logo");
  }

  return stockData;
}

// Fallback to brapi.dev
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

// Main function: tries Yahoo Finance first (faster), fallback to brapi.dev
// Uses corsproxy.io to bypass Yahoo Finance CORS
export async function fetchStockData(symbol: string): Promise<StockApiResponse> {
  // Try Yahoo Finance first via CORS proxy
  if (USE_YAHOO_FINANCE) {
    try {
      console.log(`Fetching ${symbol} from Yahoo Finance via CORS proxy...`);
      return await fetchFromYahoo(symbol);
    } catch (yahooError) {
      console.warn("Yahoo Finance failed, trying brapi.dev...", yahooError);
    }
  }

  // Fallback: use brapi.dev
  try {
    console.log(`Fetching ${symbol} from brapi.dev...`);
    return await fetchFromBrapi(symbol);
  } catch (brapiError) {
    console.error("Error fetching data:", brapiError);
    throw new Error("Could not fetch stock data. Check the symbol or configure a brapi.dev token.");
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

// Interface for historical data
export interface HistoricalDataPoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

// Available time range types
export type TimeRange = "1w" | "1mo" | "3mo" | "6mo" | "1y" | "5y";

// Range mapping for Yahoo Finance
const yahooRangeMap: Record<TimeRange, string> = {
  "1w": "7d",
  "1mo": "1mo",
  "3mo": "3mo",
  "6mo": "6mo",
  "1y": "1y",
  "5y": "5y",
};

// Range mapping for brapi.dev
const brapiRangeMap: Record<TimeRange, string> = {
  "1w": "1d", // brapi doesn't have 7d, uses 1d and limits result
  "1mo": "1mo",
  "3mo": "3mo",
  "6mo": "6mo",
  "1y": "1y",
  "5y": "5y",
};

// Fetch historical data with configurable range
export async function fetchHistoricalData(
  symbol: string,
  range: TimeRange = "1mo"
): Promise<HistoricalDataPoint[]> {
  if (USE_YAHOO_FINANCE) {
    try {
      return await fetchHistoricalFromYahoo(symbol, range);
    } catch (error) {
      console.warn("Yahoo historical failed, trying brapi...", error);
    }
  }

  // Fallback to brapi.dev
  return await fetchHistoricalFromBrapi(symbol, range);
}

// Fetch historical data from Yahoo Finance
async function fetchHistoricalFromYahoo(
  symbol: string,
  range: TimeRange = "1mo"
): Promise<HistoricalDataPoint[]> {
  const yahooSymbol = toYahooSymbol(symbol);
  const yahooRange = yahooRangeMap[range];
  const url = `${YAHOO_BASE_URL}/${yahooSymbol}?interval=1d&range=${yahooRange}`;
  const proxiedUrl = getProxiedUrl(url);

  const response = await fetch(proxiedUrl);

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

  return historicalData.filter(d => d.close > 0); // Remove invalid data
}

// Fetch historical data from brapi.dev
async function fetchHistoricalFromBrapi(
  symbol: string,
  timeRange: TimeRange = "1mo"
): Promise<HistoricalDataPoint[]> {
  const token = getApiToken();
  const range = brapiRangeMap[timeRange];
  const interval = "1d"; // Daily

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
