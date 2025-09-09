import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { TastyTradeApi } from '$lib/services/tastytrade-api';
import { SessionManager } from '$lib/services/session';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const query = url.searchParams.get('query');
	
	if (!query || query.length < 2) {
		return json({ results: [] });
	}
	
	const sessionManager = new SessionManager(cookies);
	const session = sessionManager.getSession();
	
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	
	const api = new TastyTradeApi();
	
	try {
		const results = await api.searchSymbols(session.sessionToken, query);
		return json({ results: results.data?.items || [] });
	} catch (error) {
		console.error('Error searching symbols:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to search symbols' },
			{ status: 500 }
		);
	}
};
