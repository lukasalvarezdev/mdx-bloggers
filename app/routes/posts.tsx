import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Link, redirect, useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { fetchApi } from '~/utils/fetch-api.server';
import { cn } from '~/utils/misc';
import { getSession } from '~/utils/session.server';

export const meta: MetaFunction = () => {
	return [{ title: 'Remix Blog Stack by Lukas Alvarez' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
	const owner = 'lukasalvarezdev'; // Replace with dynamic owner if necessary
	const repo = 'lukasalvarez.com'; // Replace with dynamic repo if necessary
	const path = 'app/content'; // Specify the file path you want to read
	const session = await getSession(request);
	const accessToken = session.get('accessToken');

	if (!accessToken) throw redirect('/auth/github');

	const response = await fetchApi(`/${owner}/${repo}/contents/${path}`, {
		method: 'GET',
		token: accessToken,
		schema: z.array(z.object({ name: z.string() })),
	});

	if (!response.success) throw new Error('Failed to fetch posts');

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
							<Link to={`/posts/${post.name}`} className="hover:underline">
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
							<Link to={`/posts/${post.name}`} className="underline font-medium">
								Read More
							</Link>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
