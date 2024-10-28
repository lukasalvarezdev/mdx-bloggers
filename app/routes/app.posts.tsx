import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { isRouteErrorResponse, Link, useLoaderData, useRouteError } from '@remix-run/react';
import { githubApi } from '~/utils/github.api';
import { cn } from '~/utils/misc';
import { protectRoute } from '~/utils/session.server';
import { LinkButton } from '~/utils/ui';
import { getUserPrefs } from '~/utils/user-prefs.server';

export const meta: MetaFunction = () => {
	return [{ title: 'Remix Blog Stack by Lukas Alvarez' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
	const accessToken = await protectRoute(request);
	const user = await githubApi.getUser({ accessToken });

	if (!user) throw new Error('Failed to fetch user');

	const { repo, dir } = await getUserPrefs(request);

	const response = await githubApi.getPosts({ accessToken, owner: user.username, repo, dir });

	if (!response.success) {
		if (response.error.includes('Not Found') && response.error.includes('404')) {
			throw new Response('Post not found', { status: 404 });
		}

		throw new Error(response.error);
	}

	return { posts: response.data };
}

export default function Component() {
	const { posts } = useLoaderData<typeof loader>();

	return (
		<div className="cont mx-auto px-4 py-8 max-w-3xl">
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-center mb-2">My CMS Blog</h1>
				<p className="text-center text-muted-foreground mb-4">
					Welcome to our content management system
				</p>
				<div className="relative">
					<input
						name="search"
						type="text"
						placeholder="Search blog posts..."
						className={cn(
							'w-full px-4 py-2 rounded-md border border-gray-200',
							'focus:outline-none focus:ring focus:ring-primary-500 focus:border-primary-500',
						)}
					/>
				</div>
			</header>

			<div className="space-y-6">
				{posts.map(post => (
					<div
						className={cn('bg-white p-6 rounded-lg shadow-sm border border-gray-200')}
						key={post.name}
					>
						<h2 className="text-xl font-semibold mb-2">
							<Link to={`/app/posts/${post.name}`} className="hover:underline">
								{post.name}
							</Link>
						</h2>
						<p className="text-muted-foreground mb-2">
							Learn how to build fast and scalable web applications with Next.js, the React
							framework for production.
						</p>
						<div className="flex justify-between items-center text-sm text-muted-foreground">
							<span>Published on: 2023-05-15</span>
						</div>
						<div className="flex justify-end">
							<Link to={`/app/posts/${post.name}`} className="underline font-medium">
								Read More
							</Link>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		return (
			<div className="flex pt-20 justify-center w-full">
				<div className="text-center">
					<h1>
						{error.status} {error.statusText}
					</h1>
					<p>{error.data}</p>

					<LinkButton to="/app/posts" className="block mt-8">
						Go back
					</LinkButton>
				</div>
			</div>
		);
	} else if (error instanceof Error) {
		return (
			<div className="flex pt-20 justify-center w-full">
				<div className="text-center">
					<h1>Unknown Error</h1>
					<p>{error.message}</p>

					<LinkButton to="/app/posts" className="block mt-8">
						Go back
					</LinkButton>
				</div>
			</div>
		);
	} else {
		return <h1>Unknown Error</h1>;
	}
}
