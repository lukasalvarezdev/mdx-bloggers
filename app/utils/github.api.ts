import { z } from 'zod';
import { fetchApi } from './fetch-api.server';

export async function getPosts({
	accessToken,
	dir,
	owner,
	repo,
}: {
	owner: string;
	repo: string;
	dir: string;
	accessToken: string;
}) {
	return await fetchApi(`/repos/${owner}/${repo}/contents/${dir}`, {
		method: 'GET',
		token: accessToken,
		schema: z.array(z.object({ name: z.string() })),
	});
}

export async function getUser({ accessToken }: { accessToken: string }) {
	const response = await fetchApi('/user', {
		method: 'GET',
		token: accessToken,
		schema: z.object({ name: z.string() }),
	});
	if (!response.success) return null;
	return response.data;
}
