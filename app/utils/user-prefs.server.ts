import { createCookie, redirect } from '@remix-run/node';
import { z } from 'zod';

export const userPrefs = createCookie('user-prefs', {
	secrets: [process.env.SESSION_SECRET!],
	maxAge: 60 * 60 * 24 * 365, // one year
});

const cookieSchema = z.object({ repo: z.string(), dir: z.string() });

export async function getUserPrefs(request: Request): Promise<z.infer<typeof cookieSchema>> {
	const cookieHeader = request.headers.get('Cookie');
	const cookie = (await userPrefs.parse(cookieHeader)) || {};

	try {
		return cookieSchema.parse(cookie);
	} catch (e) {
		throw redirect('/get-started?error=invalid-cookie');
	}
}
