import type { TastyTradeSessionResponse, TastyTradeErrorResponse, WatchlistsResponse, WatchlistDetailResponse, CreateWatchlistRequest, WatchlistDetail, MarketDataResponse } from '$lib/types/api';
import { TASTYTRADE_BASE_URL, TASTYTRADE_LOGIN, TASTYTRADE_PASSWORD } from '$env/static/private';
export class TastyTradeApi {
	private readonly baseUrl: string;
    private readonly fetch: typeof fetch;

	constructor() {
		this.baseUrl = TASTYTRADE_BASE_URL;
		this.fetch = fetch;
	}

    async createSession(
		userLogin?: string, 
		userPassword?: string
	): Promise<TastyTradeSessionResponse> {
		const login = TASTYTRADE_LOGIN;
		const password = TASTYTRADE_PASSWORD;

		if (!login || !password) {
			throw new Error('Login credentials are required');
		}

		try {
			const response = await this.fetch(`${this.baseUrl}/sessions`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					login,
					password
				})
			});

			const responseData = await response.json();

			if (!response.ok) {
				const errorData = responseData as TastyTradeErrorResponse;
				const errorMessage = errorData.error?.message || 
					errorData.errors?.[0]?.message || 
					'Authentication failed';
				
				throw new Error(errorMessage);
			}

			return responseData as TastyTradeSessionResponse;
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}

			console.error('TastyTrade API Error:', error);
			throw new Error('Failed to connect to TastyTrade API. Please try again.');
		}
    }
    async getWatchlists(sessionToken: string): Promise<WatchlistsResponse> {
		try {
			const response = await this.fetch(`${this.baseUrl}/watchlists`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': sessionToken
				}
			});

			const responseData = await response.json();

			if (!response.ok) {
				const errorData = responseData as TastyTradeErrorResponse;
				const errorMessage = errorData.error?.message || 
					errorData.errors?.[0]?.message || 
					'Failed to fetch watchlists';
				
				throw new Error(errorMessage);
			}

			return responseData as WatchlistsResponse;
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}

			console.error('TastyTrade API Error:', error);
			throw new Error('Failed to fetch watchlists. Please try again.');
		}
	}
    async searchSymbols(sessionToken: string, query: string) {
        try {
            const response = await this.fetch(`${this.baseUrl}/symbols/search/${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionToken
                }
            });
    
            const responseData = await response.json();
    
            if (!response.ok) {
                const errorData = responseData as TastyTradeErrorResponse;
                const errorMessage = errorData.error?.message || 
                    errorData.errors?.[0]?.message || 
                    'Failed to search symbols';
                
                throw new Error(errorMessage);
            }
    
            return responseData;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
    
            console.error('TastyTrade API Error:', error);
            throw new Error('Failed to search symbols. Please try again.');
        }
    }
    async createWatchlist(
        sessionToken: string, 
        name: string, 
        symbols: string[] = [],
        groupName?: string
      ): Promise<WatchlistsResponse> {
        try {
          const watchlistEntries = symbols.map(symbol => ({
            symbol,
            'instrument-type': 'equity'
          }));
      
          const payload: CreateWatchlistRequest = {
            name,
            'watchlist-entries': watchlistEntries
          };
      
          if (groupName) {
            payload['group-name'] = groupName;
          }
      
          const response = await this.fetch(`${this.baseUrl}/watchlists`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': sessionToken
            },
            body: JSON.stringify(payload)
          });
      
          const responseData = await response.json();
      
          if (!response.ok) {
            const errorData = responseData as TastyTradeErrorResponse;
            const errorMessage = errorData.error?.message || 
              errorData.errors?.[0]?.message || 
              'Failed to create watchlist';
            
            throw new Error(errorMessage);
          }
      
          return responseData as WatchlistsResponse;
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
      
          console.error('TastyTrade API Error:', error);
          throw new Error('Failed to create watchlist. Please try again.');
        }
    }
    async getWatchlistDetail(sessionToken: string, watchlistId: string): Promise<WatchlistDetailResponse> {
        try {
          const response = await this.fetch(`${this.baseUrl}/watchlists/${watchlistId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': sessionToken
            }
          });
      
          const responseData = await response.json();
      
          if (!response.ok) {
            const errorData = responseData as TastyTradeErrorResponse;
            const errorMessage = errorData.error?.message || 
              errorData.errors?.[0]?.message || 
              'Failed to fetch watchlist details';
            
            throw new Error(errorMessage);
          }
      
          return responseData as WatchlistDetailResponse;
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
      
          console.error('TastyTrade API Error:', error);
          throw new Error('Failed to fetch watchlist details. Please try again.');
        }
    }
    async updateWatchlist(
        sessionToken: string, 
        watchlistName: string, 
        updateData: {
          name: string;
          'group-name'?: string;
          'order-index'?: number;
          'watchlist-entries'?: Array<{
            symbol: string;
            'instrument-type': string;
          }>;
        }
      ): Promise<WatchlistDetailResponse> {
        try {
          const response = await this.fetch(`${this.baseUrl}/watchlists/${watchlistName}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': sessionToken
            },
            body: JSON.stringify(updateData)
          });
          
          if (!response.ok) {
            const responseData = await response.json();
            const errorData = responseData as TastyTradeErrorResponse;
            const errorMessage = errorData.error?.message || 
              errorData.errors?.[0]?.message || 
              'Failed to update watchlist';
            
            throw new Error(errorMessage);
          }
          
          const responseData = await response.json();
          return responseData as WatchlistDetailResponse;
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
          
          console.error('TastyTrade API Error:', error);
          throw new Error('Failed to update watchlist. Please try again.');
        }
      }
    async deleteWatchlist(sessionToken: string, watchlistName: string): Promise<WatchlistDetailResponse> {
        try {
            const response = await this.fetch(`${this.baseUrl}/watchlists/${watchlistName}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': sessionToken
                }
            });
            if (!response.ok) {
                const responseData = await response.json();
                const errorData = responseData as TastyTradeErrorResponse;
                const errorMessage = errorData.error?.message || 
                  errorData.errors?.[0]?.message || 
                  'Failed to delete watchlist';
                throw new Error(errorMessage);
            }
            const responseData = await response.json();
            return responseData as WatchlistDetailResponse;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            console.error('TastyTrade API Error:', error);
            throw new Error('Failed to delete watchlist. Please try again.');
        }
    }
    async getMarketData(sessionToken: string, symbol: string): Promise<MarketDataResponse> {
        try {
          const response = await this.fetch(`${this.baseUrl}/market-data/${encodeURIComponent(symbol)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': sessionToken
            }
          });
      
          const responseData = await response.json();
      
          if (!response.ok) {
            const errorData = responseData as TastyTradeErrorResponse;
            const errorMessage = errorData.error?.message || 
              errorData.errors?.[0]?.message || 
              `Failed to fetch market data for ${symbol}`;
            
            throw new Error(errorMessage);
          }
      
          return responseData as MarketDataResponse;
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
      
          console.error('TastyTrade API Error:', error);
          throw new Error(`Failed to fetch market data for ${symbol}. Please try again.`);
        }
    }
    async getMarketDataBatch(sessionToken: string, symbols: string[]): Promise<Record<string, MarketData>> {
        try {
          const promises = symbols.map(symbol => 
            this.getMarketData(sessionToken, symbol)
              .then(response => ({ symbol, data: response.data }))
              .catch(error => {
                console.error(`Error fetching data for ${symbol}:`, error);
                return { 
                  symbol, 
                  data: { 
                    symbol,
                    'instrument-type': 'Equity',
                    bid: '--',
                    ask: '--',
                    last: '--',
                    'updated-at': new Date().toISOString(),
                    'bid-size': 0,
                    'ask-size': 0,
                    'summary-date': '',
                    'prev-close-date': '',
                    open: '--',
                    'prev-close': '--',
                    'day-low-price': '--',
                    'day-high-price': '--',
                    'year-low-price': '--',
                    'year-high-price': '--',
                    'low-limit-price': '--',
                    'high-limit-price': '--',
                    'is-trading-halted': false,
                    mid: '--',
                    mark: '--'
                  } as MarketData
                };
              })
          );
      
          const results = await Promise.all(promises);
          
          return results.reduce((acc, { symbol, data }) => {
            acc[symbol] = data;
            return acc;
          }, {} as Record<string, MarketData>);
        } catch (error) {
          console.error('Error in batch market data fetch:', error);
          throw new Error('Failed to fetch market data. Please try again.');
        }
      }
}