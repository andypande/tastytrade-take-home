import { dev } from '$app/environment';
import type { AppSession } from '$lib/types/api';
import type { Cookies } from '@sveltejs/kit';

const SESSION_COOKIE_NAME = 'tt-session';
const SESSION_EXPIRY_HOURS = 24;

export class SessionManager {
	private cookies: Cookies;

	constructor(cookies: Cookies) {
		this.cookies = cookies;
	}

	createSession(sessionData: AppSession): void {
		const sessionJson = JSON.stringify(sessionData);
		
		this.cookies.set(SESSION_COOKIE_NAME, sessionJson, {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'strict',
			maxAge: 60 * 60 * SESSION_EXPIRY_HOURS
		});
	}

	getSession(): AppSession | null {
		const sessionCookie = this.cookies.get(SESSION_COOKIE_NAME);
		
		if (!sessionCookie) {
			return null;
		}

		try {
			const session = JSON.parse(sessionCookie) as AppSession;
			
			const expirationDate = new Date(session.sessionExpiration);
			if (expirationDate <= new Date()) {
				this.destroySession();
				return null;
			}

			return session;
		} catch (error) {
			console.error('Failed to parse session cookie:', error);
			this.destroySession();
			return null;
		}
	}

	destroySession(): void {
		this.cookies.delete(SESSION_COOKIE_NAME, {
			path: '/',
		});
	}

	isAuthenticated(): boolean {
		return this.getSession() !== null;
	}
}