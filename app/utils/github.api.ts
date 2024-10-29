import { z } from 'zod';
import { fetchApi } from './fetch-api.server';

async function getPosts({
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

async function getPostBySlug({
	accessToken,
	dir,
	owner,
	repo,
	slug,
}: {
	owner: string;
	repo: string;
	dir: string;
	slug: string;
	accessToken: string;
}) {
	return await fetchApi(`/repos/${owner}/${repo}/contents/${dir}/${slug}`, {
		method: 'GET',
		token: accessToken,
		schema: z.object({ download_url: z.string(), sha: z.string() }),
	});
}

async function getUser({ accessToken }: { accessToken: string }) {
	const response = await fetchApi('/user', {
		method: 'GET',
		token: accessToken,
		schema: z.object({ name: z.string(), login: z.string() }).transform(data => ({
			name: data.name,
			username: data.login,
		})),
	});
	if (!response.success) return null;
	return response.data;
}

async function getRepos(token: string) {
	return await fetchApi('/user/repos', {
		method: 'GET',
		token,
		schema: z.array(z.object({ name: z.string() })),
	});
}

async function updateFile({
	accessToken,
	owner,
	repo,
	dir,
	slug,
	content,
	sha,
}: {
	owner: string;
	repo: string;
	dir: string;
	slug: string;
	content: string;
	accessToken: string;
	sha: string;
}) {
	const response = await fetchApi(`/repos/${owner}/${repo}/contents/${dir}/${slug}`, {
		method: 'PUT',
		token: accessToken,
		body: {
			message: 'Update post',
			content: Buffer.from(content).toString('base64'),
			sha,
		},
		schema: z.object({ content: z.object({ sha: z.string() }) }),
	});

	return response;
}

export const githubApi = {
	getPosts,
	getPostBySlug,
	getUser,
	getRepos,
	updateFile,
};
