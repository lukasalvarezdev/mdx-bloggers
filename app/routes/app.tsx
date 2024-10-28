import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { githubApi } from '~/utils/github.api';
import { blogSession, getSession, protectRoute } from '~/utils/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
	const accessToken = await protectRoute(request);
	const user = await githubApi.getUser({ accessToken });

	if (!user) {
		const session = await getSession(request);
		throw redirect('/login', {
			headers: { 'Set-Cookie': await blogSession.destroySession(session) },
		});
	}

	return { user };
}

export default function Component() {
	return <Outlet />;
}
