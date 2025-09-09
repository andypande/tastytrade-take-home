import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SessionManager } from '$lib/services/session';
import { TastyTradeApi } from '$lib/services/tastytrade-api';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const symbols = url.searchParams.get('symbols');
	
	if (!symbols) {
		return json({ error: 'Symbols parameter is required' }, { status: 400 });
	}
	
	const symbolArray = symbols.split(',');
	
	const sessionManager = new SessionManager(cookies);
	const session = sessionManager.getSession();
	
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	
	const api = new TastyTradeApi();
	
	try {
		const marketData = await api.getMarketDataBatch(session.sessionToken, symbolArray);
		return json({ marketData });
	} catch (error) {
		console.error('Error fetching market data:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch market data' },
			{ status: 500 }
		);
	}
};
