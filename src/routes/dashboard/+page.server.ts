import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { SessionManager } from '$lib/services/session';
import { TastyTradeApi } from '$lib/services/tastytrade-api';

export const load: PageServerLoad = async ({ cookies }) => {
	const sessionManager = new SessionManager(cookies);
	const session = sessionManager.getSession();


	if (!session) {
		throw redirect(302, '/');
	}

    const api = new TastyTradeApi();

    try {
		const watchlistsResponse = await api.getWatchlists(session.sessionToken);
		return {
			session,
			watchlists: watchlistsResponse.data.items
		};
	} catch (err) {
		console.error('Error fetching watchlists:', err);
		return {
			session,
			watchlists: [],
			error: err instanceof Error ? err.message : 'Failed to fetch watchlists'
		};
	}
};


export const actions: Actions = {
    createWatchlist: async ({ request, cookies }) => {
        const sessionManager = new SessionManager(cookies);
        const session = sessionManager.getSession();
        
        if (!session) {
          throw redirect(302, '/');
        }
        
        const data = await request.formData();
        const name = data.get('name');
        const symbolsJson = data.get('symbols');
        
        if (!name || typeof name !== 'string') {
          return { 
            success: false, 
            error: 'Watchlist name is required' 
          };
        }
        
        let symbols: string[] = [];
        if (symbolsJson && typeof symbolsJson === 'string') {
          try {
            symbols = JSON.parse(symbolsJson);
            if (!Array.isArray(symbols)) {
              throw new Error('Invalid symbols format');
            }
          } catch (error) {
            return { 
              success: false, 
              error: 'Invalid symbols format' 
            };
          }
        }
        
        const api = new TastyTradeApi();
        
        try {
          await api.createWatchlist(session.sessionToken, name, symbols);
          
          const watchlistsResponse = await api.getWatchlists(session.sessionToken);
          
          return {
            success: true,
            message: 'Watchlist created successfully',
            watchlists: watchlistsResponse.data.items
          };
        } catch (error) {
          console.error('Error creating watchlist:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create watchlist'
          };
        } finally {
			throw redirect(302, '/dashboard?notification=watchlist-created&name=${encodeURIComponent(name)}');
		}
      },
      deleteWatchlist: async ({ request, cookies }) => {
        const data = await request.formData();
        const watchlistName = data.get('watchlistName');
		
		if (!watchlistName) {
			return { success: false, error: 'Watchlist name is required' };
		}
		
		const sessionManager = new SessionManager(cookies);
		const session = sessionManager.getSession();
		
		if (!session) {
			throw redirect(302, '/');
		}
		
		const api = new TastyTradeApi();
		
		try {
			await api.deleteWatchlist(session.sessionToken, watchlistName);
			
		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}
			
			console.error('Error deleting watchlist:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to delete watchlist'
			};
		} 
	}    
};