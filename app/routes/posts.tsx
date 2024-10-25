import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Outlet, redirect, useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { fetchApi } from '~/utils/fetch-api.server';
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
		<div className="flex ">
			<div className="flex">
				<h1>Posts</h1>
				<ul>
					{posts.map(post => (
						<li key={post.name}>{post.name}</li>
					))}
				</ul>
			</div>
			<Outlet />
		</div>
	);
}
