import { redirect } from '@remix-run/node';

export async function loader() {
	const clientId = process.env.GITHUB_CLIENT_ID;
	const state = Math.random().toString(36).substring(7);
	const params = new URLSearchParams({
		redirect_uri: process.env.GITHUB_CALLBACK_URL!,
		client_id: clientId!,
		scope: 'repo',
		state,
	});

	return redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}
