import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { SessionManager } from '$lib/services/session';
import { TastyTradeApi } from '$lib/services/tastytrade-api';

export const load: PageServerLoad = async ({ params, cookies, fetch }) => {
	const watchlistName = params.name;
	
	if (!watchlistName) {
		throw error(404, 'Watchlist not found');
	}
	
	const sessionManager = new SessionManager(cookies);
	const session = sessionManager.getSession();

	if (!session) {
		throw redirect(302, '/');
	}

	const api = new TastyTradeApi(fetch);
	
	try {
		const watchlistResponse = await api.getWatchlistDetail(session.sessionToken, watchlistName);
		const watchlistDetail = watchlistResponse.data;
		
		const symbols = watchlistDetail['watchlist-entries']?.map(entry => entry.symbol) || [];
		
		let marketData = {};
		if (symbols.length > 0) {
			marketData = await api.getMarketDataBatch(session.sessionToken, symbols);
		}
		
		return {
			session,
			watchlist: {
				name: watchlistName,
				displayName: watchlistDetail.name,
				symbols,
				groupName: watchlistDetail['group-name'],
				orderIndex: watchlistDetail['order-index']
			},
			marketData
		};
	} catch (err) {
		console.error('Error fetching watchlist:', err);
		throw error(404, 'Watchlist not found or could not be loaded');
	}
};

export const actions: Actions = {
	updateWatchlist: async ({ request, params, cookies }) => {
		const watchlistName = params.name;
		
		if (!watchlistName) {
			return { success: false, error: 'Watchlist name is required' };
		}
		
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
		
		const updateData = {
			name: name
		};
		
		if (symbolsJson && typeof symbolsJson === 'string') {
			try {
				const symbols = JSON.parse(symbolsJson);
				if (!Array.isArray(symbols)) {
					throw new Error('Invalid symbols format');
				}
				
				updateData['watchlist-entries'] = symbols.map(symbol => ({
					symbol,
					'instrument-type': 'equity'
				}));
				
			} catch (error) {
				return { 
					success: false, 
					error: 'Invalid symbols format' 
				};
			}
		}
		
		const api = new TastyTradeApi();
		
		try {
			await api.updateWatchlist(
				session.sessionToken,
				watchlistName,
				updateData
			);
			
			return {
				success: true,
				message: 'Watchlist updated successfully'
			};
		} catch (error) {
			console.error('Error updating watchlist:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to update watchlist'
			};
		} finally {	
			throw redirect(302, `/dashboard?notification=watchlist-updated&name=${encodeURIComponent(name)}`);
		}
	},
	deleteWatchlist: async ({ params, cookies }) => {
		const watchlistName = params.name;
		
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
		} finally {
			throw redirect(302, '/dashboard?notification=watchlist-deleted&name=${encodeURIComponent(watchlistName)}');
		}
	}
};