import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { blogSession, getSession } from '~/utils/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
	const code = new URL(request.url).searchParams.get('code');

	if (!code) throw new Error('No code found in the callback');

	const client_id = process.env.GITHUB_CLIENT_ID;
	const client_secret = process.env.GITHUB_CLIENT_SECRET;

	const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		body: JSON.stringify({ client_id, client_secret, code }),
	});

	const data = await tokenResponse.json();
	const accessToken = data.access_token;

	if (!accessToken) throw new Error('No access token received');

	const session = await getSession(request);
	session.set('accessToken', accessToken);

	return redirect('/get-started', {
		headers: { 'Set-Cookie': await blogSession.commitSession(session) },
	});
}
