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
	return await fetchApi(`/${owner}/${repo}/contents/${dir}`, {
		method: 'GET',
		token: accessToken,
		schema: z.array(z.object({ name: z.string() })),
	});
}
