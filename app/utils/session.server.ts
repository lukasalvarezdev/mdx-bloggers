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

export async function protectRoute(request: Request) {
	const token = await getAccessToken(request);

	if (!token) {
		const session = await getSession(request);
		throw redirect('/login', {
			headers: { 'Set-Cookie': await blogSession.destroySession(session) },
		});
	}

	return token;
}
