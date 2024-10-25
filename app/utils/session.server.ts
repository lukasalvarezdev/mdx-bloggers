import { createCookieSessionStorage, redirect } from '@remix-run/node';

export const blogSession = createCookieSessionStorage({
	cookie: {
		name: '__blog-session',
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secrets: [process.env.SESSION_SECRET!],
		secure: process.env.NODE_ENV === 'production',
	},
});

export async function getSession(request: Request) {
	const cookie = request.headers.get('Cookie');
	return blogSession.getSession(cookie);
}

async function getAccessToken(request: Request): Promise<string | undefined> {
	const session = await getSession(request);
	return session.get('accessToken');
}

export async function isTokenExpired(request: Request) {
	const token = await getAccessToken(request);
	if (!token) return true;

	try {
		const decoded = decodeJWT(token);
		const exp = typeof decoded.payload.exp === 'number' ? decoded.payload.exp : 0;

		return Date.now() >= exp * 1000;
	} catch (error) {
		return true;
	}
}

function decodeJWT(token: string) {
	const parts = token.split('.');
	if (parts.length !== 3) {
		throw new Error('Invalid JWT format');
	}

	try {
		const decodedHeader = JSON.parse(atob(parts[0]!));
		const decodedPayload = JSON.parse(atob(parts[1]!));

		return {
			header: decodedHeader,
			payload: decodedPayload,
			signature: parts[2], // The signature part as-is
		};
	} catch (error) {
		return { header: {}, payload: {}, signature: '' };
	}
}

export async function protectRoute(request: Request) {
	const isExpired = await isTokenExpired(request);

	if (isExpired) {
		const session = await getSession(request);
		throw redirect('/login', {
			headers: { 'Set-Cookie': await blogSession.destroySession(session) },
		});
	}
}
