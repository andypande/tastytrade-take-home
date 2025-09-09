export interface TastyTradeUser {
	email: string;
	'external-id': string;
	'is-confirmed': boolean;
	'is-two-factor-sessions-enforced': boolean;
	username: string;
}

export interface TastyTradeSessionData {
	user: TastyTradeUser;
	'session-expiration': string;
	'session-token': string;
}

export interface TastyTradeSessionResponse {
	data: TastyTradeSessionData;
	context: string;
}

export interface TastyTradeErrorResponse {
	error?: {
		code?: string;
		message?: string;
	};
	errors?: Array<{
		code: string;
		message: string;
	}>;
}

export interface AppSession {
	sessionToken: string;
	sessionExpiration: string;
	user: TastyTradeUser;
}

export interface Watchlist {
	id: string;
	name: string;
	group_name?: string;
	order_index?: number;
}

export interface WatchlistsResponse {
	data: {
		items: Watchlist[];
	};
	context: string;
}

export interface WatchlistEntry {
  symbol: string;
  'instrument-type'?: string;
}

export interface CreateWatchlistRequest {
  name: string;
  'group-name'?: string;
  'order-index'?: number;
  'watchlist-entries'?: WatchlistEntry[];
}

export interface WatchlistEntry {
    symbol: string;
    'instrument-type'?: string;
  }
  
export interface WatchlistDetail {
    name: string;
    'watchlist-entries': WatchlistEntry[];
    'cms-id'?: string;
    'group-name'?: string;
    'order-index'?: number;
}

export interface WatchlistDetailResponse {
    data: WatchlistDetail;
    context: string;
} 

export interface MarketData {
    symbol: string;
    'instrument-type': string;
    'updated-at': string;
    bid: string;
    ask: string;
    last: string;
    'bid-size': number;
    'ask-size': number;
    'summary-date': string;
    'prev-close-date': string;
    open: string;
    'prev-close': string;
    'day-low-price': string;
    'day-high-price': string;
    'year-low-price': string;
    'year-high-price': string;
    'low-limit-price': string;
    'high-limit-price': string;
    'is-trading-halted': boolean;
    mid: string;
    mark: string;
  }
  
export interface MarketDataResponse {
    data: MarketData;
    context: string;
}