// Metadados salvos no localStorage (sem preços)
export interface SavedStock {
  id: string;
  symbol: string;
  name: string;
}

// Stock completo com preços (em memória, sempre buscado da API)
export interface Stock extends SavedStock {
  price: number;
  change: number;
  changePercent: number;
  updatedAt: string;
  logoUrl?: string;
}

export interface StockApiResponse {
  currency: string;
  marketCap: number;
  shortName: string;
  longName: string;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: string;
  regularMarketPrice: number;
  regularMarketDayHigh: number;
  regularMarketDayRange: string;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  fiftyTwoWeekRange: string;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  symbol: string;
  logourl: string;
  priceEarnings: number;
  earningsPerShare: number;
}
