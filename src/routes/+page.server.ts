import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { TastyTradeApi } from '$lib/services/tastytrade-api';
import { SessionManager } from '$lib/services/session';
import type { AppSession } from '$lib/types/api';

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username');
		const password = data.get('password');

		if (!username || !password) {
			return fail(400, {
				error: 'Username and password are required',
				username: username as string
			});
		}

		if (typeof username !== 'string' || typeof password !== 'string') {
			return fail(400, {
				error: 'Invalid form data',
				username: username as string
			});
		}

		const sessionManager = new SessionManager(cookies);
		const api = new TastyTradeApi();

		try {			
			const sessionResponse = await api.createSession();

			const appSession: AppSession = {
				sessionToken: sessionResponse.data['session-token'],
				sessionExpiration: sessionResponse.data['session-expiration'],
				user: sessionResponse.data.user
			};

			sessionManager.createSession(appSession);
			
		} catch (error) {
			console.error('Login error:', error);

            if(error instanceof Response) {
                throw error;
            }

			if (error instanceof Error) {
				return fail(500, {
					error: error.message,
					username
				});
			}

			return fail(500, {
				error: 'An unexpected error occurred. Please try again.',
				username
			});
		}
        throw redirect(303, '/dashboard');
	}
};