import * as React from 'react';
import { LoaderFunctionArgs } from '@remix-run/node';
import { isRouteErrorResponse, Link, useLoaderData, useRouteError } from '@remix-run/react';
import { getMDXComponent } from 'mdx-bundler/client';
import { blogPageMeta } from '~/utils/blog.meta';
import { protectRoute } from '~/utils/session.server';
import { getUserPrefs } from '~/utils/user-prefs.server';
import { githubApi } from '~/utils/github.api';
import { getPostBySlug } from '~/utils/blog.server';
import { ArrowBack, LinkButton } from '~/utils/ui';

export const meta = blogPageMeta;

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { slug } = params;
	if (!slug) throw new Error('No slug provided');

	const accessToken = await protectRoute(request);
	const user = await githubApi.getUser({ accessToken });

	if (!user) throw new Error('Failed to fetch user');

	const { repo, dir } = await getUserPrefs(request);

	const response = await githubApi.getPostBySlug({
		owner: user.username,
		accessToken,
		slug,
		repo,
		dir,
	});

	if (!response.success) {
		if (response.error.includes('Not Found') && response.error.includes('404')) {
			throw new Response('Post not found', { status: 404 });
		}

		throw new Error(response.error);
	}

	const fileResponse = await fetch(response.data.download_url);

	const post = await getPostBySlug(await fileResponse.text());

	return { ...post, slug };
}

export default function BlogPost() {
	const { code, slug, metadata } = useLoaderData<typeof loader>();

	const Component = React.useMemo(() => getMDXComponent(code), [code]);

	return (
		<div key={slug} className="py-12">
			<div className="max-w-2xl mx-auto">
				<Link
					to="/app/posts"
					className="flex gap-2 mb-8 text-base text-black items-center group max-w-max"
				>
					<ArrowBack className="group-hover:-translate-x-1 transition-all" />
					Back to posts
				</Link>
				<h1 className="mb-2 text-black">{metadata.title}</h1>
				<p className="text-sm mb-8">{metadata.date}</p>
			</div>

			<div className="max-w-4xl mx-auto">
				<img
					src={metadata.bannerUrl}
					alt={metadata.bannerCredit}
					className="w-full object-cover rounded-lg mb-8"
					loading="lazy"
				/>
			</div>

			<div className="mdx max-w-2xl mx-auto">
				<Component />
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
