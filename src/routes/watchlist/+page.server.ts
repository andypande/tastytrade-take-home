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

	return {
		session
	};
};

export const actions: Actions = {
	createWatchlist: async ({ request, cookies, fetch }) => {
		const sessionManager = new SessionManager(cookies);
		const session = sessionManager.getSession();
		
		if (!session) {
			throw redirect(302, '/');
		}
		
		const data = await request.formData();
		const name = data.get('watchlist-name');
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
		
		const api = new TastyTradeApi(fetch);
		
		try {
			await api.createWatchlist(session.sessionToken, name, symbols);
			
			return {
				success: true,
				message: 'Watchlist created successfully'
			};
		} catch (error) {
			console.error('Error creating watchlist:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create watchlist'
			};
		} finally {
			throw redirect(302, `/dashboard?notification=watchlist-created&name=${encodeURIComponent(name)}`);
		}
	}
};