import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { blogSession, getSession } from '~/utils/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getSession(request);
	throw redirect('/', {
		headers: { 'Set-Cookie': await blogSession.destroySession(session) },
	});
}
