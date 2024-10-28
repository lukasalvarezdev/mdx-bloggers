import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { blogSession, getSession } from '~/utils/session.server';
import { destroyUserPrefs, userPrefs } from '~/utils/user-prefs.server';

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getSession(request);
	const destroyedUserPrefsCookie = destroyUserPrefs();

	const headers = new Headers();

	headers.append('Set-Cookie', await blogSession.destroySession(session));
	headers.append('Set-Cookie', await userPrefs.serialize(destroyedUserPrefsCookie));

	throw redirect('/', { headers });
}
