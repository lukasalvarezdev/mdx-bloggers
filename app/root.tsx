import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteLoaderData,
} from '@remix-run/react';
import type { LinksFunction, LoaderFunctionArgs, SerializeFrom } from '@remix-run/node';
import './tailwind.css';
import { getDomainUrl } from './utils/misc';
import { getUser } from './utils/github.api';
import { getSession } from './utils/session.server';

export const links: LinksFunction = () => [
	{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
	},
];

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getSession(request);
	const accessToken = session.get('accessToken');

	const user = await getUser({ accessToken });

	return {
		user,
		requestInfo: { origin: getDomainUrl(request), path: new URL(request.url).pathname },
	};
}
export type RootLoaderType = SerializeFrom<typeof loader>;

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function useRootLoaderData() {
	const data = useRouteLoaderData<RootLoaderType>('root');
	if (!data) throw new Error('No root loader data');
	return data;
}

export function useOptionalUser() {
	const { user } = useRootLoaderData();
	return user;
}
